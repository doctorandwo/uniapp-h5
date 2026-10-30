import store from '@/store';
import { doSM2Encrypt } from '@/pages_login/crypto.js';

export const T_RegisterForm = {
    publicKeyStr: 'string',
    verificationCode: 'string|captcha',
    phonenumber: 'string|phone',
    userName: 'string',
    password: data => doSM2Encrypt(data.password, data.publicKeyStr),
    sendType: () => 'register',
    produceCode: () => store.getters.headerInfo['Produce-Code'],
};
