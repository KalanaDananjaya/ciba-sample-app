/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useState } from 'react';
import {View, Image, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {AuthorizationService} from '@wso2/auth-push-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BouncyCheckbox from "react-native-bouncy-checkbox";

const storeData = async (authData) => {
    try {
        await AsyncStorage.getItem('activity').then(async (activity) => {
            let newActivity;
            console.log('Saved async activity: ' + activity);
            console.log('Type of newAccounts: ' + typeof newActivity);
            if (activity == null) {
                console.log('Type of newAccounts: ' + typeof newActivity);
                newActivity = [];
                console.log('New accounts length: ' + newActivity.length);
            } else {
                newActivity = JSON.parse(activity);
                console.log('New accounts length: ' + newActivity.length);
            }
            console.log('Type of newAccounts 2: ' + typeof newActivity);
            let ad = JSON.parse(authData);
            ad.activityId = newActivity.length == 0 ? 1 : newActivity.length + 1;
            console.log('activity ID: ' + ad.activityId);
            console.log('activity to save: ' + JSON.stringify(ad));
            newActivity.push(ad);
            await AsyncStorage.setItem('activity', JSON.stringify(newActivity)).then(
                () => {
                    console.log('New activity added to async storage');
                },
            );
        });
    } catch (e) {
        console.log('Async storage error: ' + e);
    }
};

let requestAccount;
const getAccountByDeviceId = async (id) => {
    return await AsyncStorage.getItem('accounts').then((accounts) => {
        console.log(
            'Accounts from Async at auth request:' + JSON.stringify(accounts),
        );

        let accountsObject = JSON.parse(accounts);

        console.log(
            'Required account for authentication:' +
            JSON.stringify(accountsObject.find(({deviceID}) => deviceID === id)),
        );

        requestAccount = accountsObject.find(({deviceID}) => deviceID === id);
    });
};



  


const AuthRequestScreen = ({route, navigation}) => {

    let authData = AuthorizationService.processAuthRequest(route.params);
    let metadata = JSON.parse(authData.metadata);
    let consentData = metadata.consentData;
    let application = metadata.application; //check if it is equal with authData.applicationName
    let accounts = metadata.accounts;
    let type = metadata.type;
    let errors = metadata.Errors;
    //console.log('authData'+ JSON.stringify(authData));
    console.log('consentdata' + JSON.stringify(consentData));
    console.log('accounts' + JSON.stringify(accounts));
    getAccountByDeviceId(route.params.data.deviceId).then((account) => {
        console.log('Got the required account: ' + JSON.stringify(account));
        return account;
    });

    accounts = accounts.map((data)=> {
        return { "checked": false, "account_id": data.account_id, "display_name": data.display_name}
    })  


    const [checkboxes, setCheckboxes] = useState(accounts);
  
    const getApprovedAccountIds = () => {
        const approved_account_ids=[];
        checkboxes.map((account_checkbox) =>{
        if(account_checkbox.checked=== true){
            approved_account_ids.push(account_checkbox.account_id);
        }
        });
        console.log("approved_account_ids: " + JSON.stringify(approved_account_ids));
        return approved_account_ids;
    }
      
      
      const toggleCheckbox = (id, index) => {
          console.log("checkbox clicked id: "+id)
          const checkboxData = [...checkboxes];
          checkboxData[index].checked = !checkboxData[index].checked;
          setCheckboxes(checkboxData);
          console.log(`checkbox props: ${JSON.stringify(checkboxes)}`)
      }

    const checBoxesView = checkboxes.map((account_checkbox, index) => {
        return (
          <View style={{flexDirection:"row"}}> 
              <BouncyCheckbox
              key={account_checkbox.account_id}
              isChecked={account_checkbox.checked}
              text={account_checkbox.display_name}
              onPress={() => toggleCheckbox(account_checkbox.id, index)}
              fillColor="green"
              textStyle={{
                textDecorationLine: "none",
              }}
              />
          </View>
        );
    });

    let organizedConsentData = {"permissions": [], "expiration": {} };
    consentData.map(function(element, index){
        if (element.title ==="Permissions"){
            organizedConsentData.permissions = element.data;
        }
        if (element.title ==="Expiration Date Time"){
            organizedConsentData.expiration = element.data[0];
            let timestamp = Date.parse(organizedConsentData.expiration);
            let dateObject = new Date(timestamp);

            organizedConsentData.expiration = {
                "date": dateObject.toDateString(),
                "time": dateObject.toTimeString().split(" ")[0]
            }
        }
    });

    let permissionList = organizedConsentData.permissions.map((element) => {
        return (<Text style={styles.infoCardTextSmall}>- {element}</Text>)
    })
    
    

    return (
        
        <ScrollView style={styles.scrollView}>
            <View style={{ height: '100%' , flex: 1}}>
                {/* Timer view */}
                {/* <View/> */}

                {/* Logo view */}
                <View style={styles.logoView}>
                    <Image
                        source={require('../assets/img/wso2logo.png')}
                        style={styles.logo}
                    />
                </View>

                {/* Auth request information view */}
                <View>
                    <View style={styles.titleView}>
                        <Text style={styles.title}>Are you trying to sign in?</Text>
                    </View>

                    {/* <View>
                        <View style={[styles.center, styles.connectionCodeView]}>
                            <Text style={[styles.connectionCodeTitle, styles.center]}>
                                Connection Code
                            </Text>
                            <Text style={styles.connectionCode}>
                                {authData.connectionCode} {/* 216 765 */}
                            {/* </Text>
                        </View>
                    </View> */} 

                    {/* Information cards */}
                    <View style={styles.infoSection}>

                        <View style={styles.infoCardSection}>
                            <View style={styles.infoCardView}>
                                <Image
                                    source={require('../assets/img/awesome-user.png')}
                                    style={styles.infoCardImage}
                                />
                                <View style={styles.infoCardTextView}>
                                    <Text style={styles.infoCardTextBig}>
                                        {authData.displayName}
                                    </Text>
                                    <Text style={styles.infoCardTextSmall}>
                                        {authData.username}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.infoCardView}>
                                <Image
                                    source={require('../assets/img/awesome-building.png')}
                                    style={[styles.infoCardImage, {height: '100%'}]}
                                />
                                <View style={styles.infoCardTextView}>
                                    <Text style={styles.infoCardTextBig}>
                                        {authData.organization}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.infoCardView}>
                                <Image
                                    source={require('../assets/img/material-web-asset.png')}
                                    style={styles.infoCardImage}
                                />
                                <View style={styles.infoCardTextView}>
                                    <Text style={styles.infoCardTextBig}>
                                        {authData.applicationName}
                                    </Text>
                                    <Text style={styles.infoCardTextSmall}>
                                        {authData.applicationUrl}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.infoCardSection, {marginTop: '10%'}]}>
                            <View style={styles.infoCardView}>
                                <Image
                                    source={require('../assets/img/material-laptop-mac.png')}
                                    style={styles.infoCardImage}
                                />
                                <View style={styles.infoCardTextView}>
                                    <Text style={styles.infoCardTextBig}>
                                        {authData.deviceName}
                                    </Text>
                                    <Text style={styles.infoCardTextSmall}>
                                        {authData.browserName}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.infoCardView}>
                                <Image
                                    source={require('../assets/img/material-location.png')}
                                    style={styles.infoCardImage}
                                />
                                <View style={styles.infoCardTextView}>
                                    <Text style={styles.infoCardTextBig}>{authData.ipAddress}</Text>
                                    <Text style={styles.infoCardTextSmall}/>
                                </View>
                            </View>
                            

                            {/* Consent section */}
                            <View style={styles.infoCardView}>
                                {/* <Image
                                    source={require('../assets/img/material-location.png')}
                                    style={styles.infoCardImage}
                                /> */}

                                
                                <View style={styles.infoCardTextView}>
                                    <Text style={styles.infoCardTextBig}>Requesting the following permissions until</Text>
                                    <Text style={styles.infoCardTextSmall}> Date : {organizedConsentData.expiration.date}</Text>
                                    <Text style={styles.infoCardTextSmall}> Time : {organizedConsentData.expiration.time}</Text>
                                    <View> 
                                        <Text style={styles.infoCardTextSmall}> Permissions : </Text>
                                        {permissionList}
                                    </View>
                                    <Text style={[styles.infoCardTextBig, {marginTop:'10%', marginBottom: '0%'}]}>{checBoxesView}</Text>
                                    <Text style={styles.infoCardTextSmall}/>
                                    
                                </View>
                            </View>



                        </View>
                    </View>
                </View>

                <View style={styles.responseButtonContainer}>
                    <TouchableOpacity
                        style={styles.responseButton}
                        activeOpacity={0.7}
                        onPress={() => {
                            const approved_account_ids = {
                                "approvedAccountIds" : getApprovedAccountIds()
                            }
                            authData.metadata = JSON.stringify(approved_account_ids);
                            AuthorizationService.sendAuthRequest(
                                authData,
                                'DENIED',
                                requestAccount,
                            )
                            .then((res) => {
                                let response = JSON.parse(res);
                                console.log(
                                    'Authorization response: ' +
                                    response.data.authenticationStatus,
                                );

                                if (response.res == 'OK') {
                                    console.log(
                                        'Activity data at success: ' + JSON.stringify(authData),
                                    );
                                    storeData(JSON.stringify(authData));
                                }

                                navigation.navigate(
                                    response.res == 'OK' ? 'Main' : 'Authorization Failed',
                                );
                            })
                            .catch((err) => {
                                console.log('Send auth error: ' + err);
                            });
                        }}>
                        <Image source={require('../assets/img/deny-button.png')}/>
                        <Text style={[styles.responseButtonText, {color: '#DB4234'}]}>
                            No
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.responseButton}
                        onPress={() => {
                            console.log('Yes auth response body: ', requestAccount.privateKey);
                            const approved_account_ids = {
                                "approvedAccountIds" : getApprovedAccountIds()
                            }
                            authData.metadata = JSON.stringify(approved_account_ids);
                            AuthorizationService.sendAuthRequest(
                                authData,
                                'SUCCESSFUL',
                                requestAccount,
                            )
                            .then((res) => {
                                let response = JSON.parse(res);
                                console.log(
                                    'Authorization response: ' +
                                    response.data.authenticationStatus,
                                );

                                if (response.res == 'OK') {
                                    console.log(
                                        'Activity data at success: ' + JSON.stringify(authData),
                                    );
                                    storeData(JSON.stringify(authData));
                                }

                                navigation.navigate(
                                    response.res == 'OK' ? 'Main' : 'Authorization Failed',
                                );
                            })
                            .catch((err) => {
                                console.log('Send auth error: ' + err);
                            });
                        }}
                        activeOpacity={0.7}>
                        <Image source={require('../assets/img/accept-button.png')}/>
                        <Text style={[styles.responseButtonText, {color: '#21AD03'}]}>
                            Yes
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{height:100}}></View>
        </ScrollView>
       
    );
};

const styles = StyleSheet.create({
    scrollView: {
        marginHorizontal: 20,
        paddingBottom: 20,
        padding: 10,
        flex: 1
      },
    logo: {
        alignSelf: 'center',
        width: '20%',
        resizeMode: 'contain',
    },
    logoText: {
        color: '#f47b20',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 18,
        top: -30,
        left: 20,
    },
    logoView: {
        marginTop: '5%',
    },
    title: {
        fontSize: 20,
        fontFamily: 'Roboto-Light',
        textAlign: 'center',
    },
    titleView: {
        marginTop: '5%',
        marginBottom: '2%',
    },
    connectionCodeView: {
        margin: '5%',
    },
    connectionCodeTitle: {
        color: '#FD7322',
        fontFamily: 'Roboto-Regular',
        fontSize: 16,
        textAlign: 'center',
    },
    connectionCode: {
        fontFamily: 'Roboto-Regular',
        fontSize: 40,
        textAlign: 'center',
        color: '#7C7C7C',
    },
    infoSection: {
        alignSelf: 'center',
        height: '80%',
        width: '90%'
    },
    infoCardSection: {
        alignSelf: 'flex-start',
    },
    infoCardView: {
        flexDirection: 'row',
        marginBottom: '6%',
    },
    infoCardImage: {
        marginVertical: '3.5%',
        height: '70%',
        width: '20%',
        alignSelf: 'center',
        resizeMode: 'contain',
    },
    infoCardTextView: {
        marginLeft: '10%',
        justifyContent: 'center',
    },
    infoCardTextBig: {
        fontFamily: 'Roboto-Regular',
        fontSize: 18,
        color: '#000',
    },
    infoCardTextSmall: {
        marginTop: '2%',
        fontFamily: 'Roboto-Regular',
        fontSize: 16,
        color: '#FD7322',  
    },
    responseButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingHorizontal: '10%',
    },
    responseButton: {
        alignItems: 'center',
        width: '90%',
    },
    responseButtonText: {
        fontFamily: 'Roboto-Bold',
        fontSize: 16,
        marginTop: '3%',
    },
});

export default AuthRequestScreen;
