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

import React from 'react';
import {View, Image, Text, StyleSheet} from 'react-native';
import {LargeButton} from '../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';

let storeData = async (account) => {
    try {
        await AsyncStorage.getItem('accounts').then(async (accounts) => {
            let newAccounts;
            console.log('Saved async accounts: ' + accounts);
            console.log('Type of newAccounts: ' + typeof newAccounts);
            if (accounts == null) {
                console.log('Type of newAccounts: ' + typeof newAccounts);
                newAccounts = [];
                console.log('New accounts length: ' + newAccounts.length);
            } else {
                newAccounts = JSON.parse(accounts);
                console.log('New accounts length: ' + newAccounts.length);
            }
            console.log('Type of newAccounts 2: ' + typeof newAccounts);
            let acc = JSON.parse(account);
            acc.accountId = newAccounts.length === 0 ? 1 : newAccounts.length + 1;
            console.log('Account ID: ' + acc.accountId);
            console.log('Account to save: ' + JSON.stringify(acc));
            newAccounts.push(acc);
            await AsyncStorage.setItem('accounts', JSON.stringify(newAccounts)).then(
                () => {
                    console.log('New account added to async storage');
                },
            );
        });
    } catch (e) {
        console.log('Async storage error: ' + e);
    }
};

const AddAccountSuccessScreen = ({route, navigation}) => {
    let accountData = route.params;
    console.log('Account data at success: ' + JSON.stringify(accountData));
    storeData(JSON.stringify(accountData))
        .then(() => {
            console.log('Test account saving: ');
        })
        .catch(() => {
            console.log('Running add to async catch.');
            navigation.navigate('Add Failed');
        });

    return (
        <View>
            <View style={styles.logoView}>
                <Image
                    source={require('../assets/img/wso2logo.png')}
                    style={styles.logo}
                />
            </View>
            <View>
                <View style={styles.resultContainer}>
                    <Image
                        source={require('../assets/img/success-icon.png')}
                        style={styles.resultImage}
                    />
                </View>
                <View>
                    <Text style={styles.resultText}>
                        New Account {'\n'} Successfully Added
                    </Text>
                </View>
            </View>
            <View style={styles.buttonView}>
                <LargeButton
                    title="Done"
                    action={() => navigation.navigate('Main', true)}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    buttonRoot: {
        marginTop: 64,
    },
    buttonView: {
        marginVertical: 10,
        marginHorizontal: '25%',
        bottom: '-35%',
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
    resultImage: {
        alignSelf: 'center',
        width: '50%',
        resizeMode: 'contain',
    },
    resultContainer: {
        marginHorizontal: '5%',
        marginTop: '25%',
        marginBottom: '10%',
    },
    title: {
        fontSize: 36,
        fontWeight: '300',
        fontFamily: 'Helvetica',
        textAlign: 'center',
    },
    resultText: {
        fontSize: 20,
        fontFamily: 'Roboto-Regular',
        textAlign: 'center',
        color: '#000',
    },
    titleView: {
        marginTop: '20%',
    },
    button: {
        top: '90%',
        paddingHorizontal: '30%',
    },
});

export default AddAccountSuccessScreen;
