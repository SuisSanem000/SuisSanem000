// API
import axios from "axios";

export {
    getAccessToken,
    isUserLogin,
    setupUserProfile,
    getUserProfile,
    logout,
    apiRegister,
    apiLogin,
    apiVerifyAccount,
    apiUserProfile,
    apiSendResetPassword,
    apiResetPassword,
    apiResendVerification,
    apiUpdateNames,
    apiUpdatePassword,
    apiRequestInvoice,
    apiBillingPortal,
    apiLicenseList,
    apiLicenseUpgrade,
    apiSeatsList,
    apiRevokeSeat,
    apiRequestSeat,
    apiDownloadSeat,
    apiContactUs,
    apiDeleteAccount,
    apiSubscribe,
    apiLog
}

const BASE_URL = "https://api.dadroit.com";

const isUserLogin = () => {
    let token = typeof localStorage !== 'undefined' && localStorage.getItem("access_token");
    return !!token;
}

const setupUserProfile = (accessToken, profile) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("profile", JSON.stringify(profile));
}

const getAccessToken = () => {
    return localStorage.getItem("access_token");
}

const getUserProfile = () => {
    if (typeof localStorage === "undefined")
        return {first_name: '', last_name: '', email: '', isLocal: true};
    let data = JSON.parse(localStorage.getItem("profile"));
    if (!data) {
        data = {first_name: '', last_name: '', email: '', isLocal: true}
    }
    return data;
}

const logout = () => {
    localStorage.clear();
}

const JSONToFormData = (json) => {
    let fd = new FormData();
    for (const [key, value] of Object.entries(json)) if (value) fd.append(key, value);
    return fd;
}

const apiRegister = async (email, password, firstName, lastName, company, agree) => {
    let res = await axios.post(BASE_URL + "/api/user/register", JSONToFormData({
        email, password, first_name: firstName, last_name: lastName, company, agree: agree ? "1" : "0"
    }), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, responseType: "json"});
    return await res.data;
}

const apiLogin = async (email, password, device) => {
    let res = await axios.post(BASE_URL + "/api/user/login", JSONToFormData({
        email, password, device
    }), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, responseType: "json"});
    let data = await res.data;
    setupUserProfile(data.access_token, null);
    return data;
}

const apiVerifyAccount = async (key) => {
    let res = await axios.get(BASE_URL + `/api/user/verify/${key}`, {responseType: "json"});
    return await res.data;
}

const apiUserProfile = async () => {
    let res = await axios.post(BASE_URL + "/api/user/profile", JSONToFormData({
        access_token: getAccessToken()
    }), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, responseType: "json"});
    let data = await res.data;
    setupUserProfile(getAccessToken(), data);
    return data;
}

const apiSendResetPassword = async (email) => {
    let res = await axios.post(BASE_URL + "/api/user/reset/request", JSONToFormData({
        email
    }), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, responseType: "json"});
    return await res.data;
}

const apiResetPassword = async (token, password) => {
    let res = await axios.post(BASE_URL + "/api/user/reset", JSONToFormData({
        token, password
    }), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, responseType: "json"});
    return await res.data;
}

const apiResendVerification = async () => {
    let res = await axios.post(BASE_URL + "/api/user/resend-verification", JSONToFormData({
        access_token: getAccessToken()
    }), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, responseType: "json"});
    return await res.data;
}

const apiUpdateNames = async (firstName, lastName) => {
    let res = await axios.post(BASE_URL + "/api/user/profile/update", JSONToFormData({
        access_token: getAccessToken(), first_name: firstName, last_name: lastName,
    }), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, responseType: "json"});
    return await res.data;
}

const apiUpdatePassword = async (oldPassword, newPassword) => {
    let res = await axios.post(BASE_URL + "/api/user/profile/update", JSONToFormData({
        access_token: getAccessToken(), old_password: oldPassword, password: newPassword,
    }), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, responseType: "json"});
    return await res.data;
}

const apiRequestInvoice = async (seats, price) => {
    let res = await axios.post(BASE_URL + "/api/billing/invoice/request", JSONToFormData({
        access_token: getAccessToken(), seats, price
    }), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, responseType: "json"});
    return await res.data;
}

const apiBillingPortal = async () => {
    let res = await axios.post(BASE_URL + "/api/billing/portal", JSONToFormData({
        access_token: getAccessToken()
    }), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, responseType: "json"});
    return await res.data;
}

const apiLicenseList = async () => {
    let res = await axios.post(BASE_URL + "/api/license/list", JSONToFormData({
        access_token: getAccessToken()
    }), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, responseType: "json"});
    return await res.data;
}

const apiSeatsList = async () => {
    let res = await axios.post(BASE_URL + "/api/license/seat/list", JSONToFormData({
        access_token: getAccessToken()
    }), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, responseType: "json"});
    return await res.data;
}

const apiRevokeSeat = async (deviceId) => {
    let res = await axios.post(BASE_URL + "/api/license/seat/revoke", JSONToFormData({
        access_token: getAccessToken(), device_id: deviceId
    }), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, responseType: "json"});
    return await res.data;
}

const apiRequestSeat = async (deviceId, deviceName) => {
    let res = await axios.post(BASE_URL + "/api/license/seat/request", JSONToFormData({
        access_token: getAccessToken(), device_id: deviceId, device_name: deviceName
    }), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, responseType: "json"});
    return await res.data;
}

const apiDownloadSeat = async (deviceId) => {
    let res = await axios.post(BASE_URL + "/api/license/seat/download", JSONToFormData({
        access_token: getAccessToken(), device_id: deviceId
    }), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, responseType: "blob"});
    return await res.data;
}

const apiContactUs = async (firstName, lastName, email, title, message) => {
    let res = await axios.post(BASE_URL + "/api/contact-us", JSONToFormData({
        first_name: firstName, last_name: lastName, email, title, message
    }), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, responseType: "json"});
    return await res.data;
}

const apiDeleteAccount = async (password) => {
    let res = await axios.post(BASE_URL + "/api/user/delete", JSONToFormData({
        access_token: getAccessToken(), password
    }), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, responseType: "json"});
    return await res.data;
}

const apiSubscribe = async (email) => {
    let res = await axios.post(BASE_URL + "/api/user/subscribe", JSONToFormData({
        access_token: getAccessToken(), email
    }), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, responseType: "json"});
    return await res.data;
}

const apiLicenseUpgrade = async () => {
    let res = await axios.post(BASE_URL + "/api/license/upgrade", JSONToFormData({
        access_token: getAccessToken()
    }), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, responseType: "json"});
    return await res.data;
}

const getUserUid = () => {
    if (localStorage.getItem("uid")) {
        return localStorage.getItem("uid");
    } else {
        let uid = window.crypto.randomUUID();
        localStorage.setItem("uid", uid);
        return uid;
    }
}

const apiLog = async (event, moreInfo) => {
    return axios.post(BASE_URL + "/api/event2", {
        uid: "da1f74e9-1f85-44a5-81b6-a7ed6d5706df",
        view: "web",
        event: event,
        data: JSON.stringify({
            ...moreInfo,
            uid: getUserUid()
        })
    });
}