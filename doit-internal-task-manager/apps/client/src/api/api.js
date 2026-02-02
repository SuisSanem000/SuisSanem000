import axios from "axios";

//This is where we make http calls and communicate with the server
const BaseURL = "http://localhost:3001/api";

export function getAuth() {
    return "8916c8d7-562a-43ec-aff9-704d96fa0262";
    // return localStorage.getItem("auth");
}

axios.defaults.headers.common['Authorization'] = getAuth();
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
axios.defaults.headers.common['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,PATCH,OPTIONS';
axios.defaults.headers.common['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With';

export async function apiInitialize() {
    const res = await axios.get(`${BaseURL}/initialize`);
    return {data: await res.data, status: res.status};
}

const isUserLogin = () => {
    let token = typeof localStorage !== 'undefined' && localStorage.getItem("auth");
    return !!token;
}

const setupAuth = (auth) => {
    localStorage.setItem("auth", auth);
}

const logout = () => {
    localStorage.clear();
}

//------------------------------------------------------------------------------ User
export async function apiLogin() {
    const res = await axios.get(`${BaseURL}/login`);
    return {data: await res.data, status: res.status};
}

export async function apiSignup(name = '', username = '', password = '', email = '', avatar = '') {
    const res = await axios.post(`${BaseURL}/signup`, {name, username, password, email, avatar});
    return {data: await res.data, status: res.status};
}

export async function apiUpdateUser(name = undefined, username = undefined, password = undefined, email = undefined, avatar = undefined, position = undefined) {
    const res = await axios.post(`${BaseURL}/update-user`, {name, username, password, email, avatar, position});
    return {data: await res.data, status: res.status};
}

export async function apiDeleteUser(user_id = undefined) {
    const res = await axios.post(`${BaseURL}/delete-user`, {user_id});
    return {data: await res.data, status: res.status};
}

export async function apiGetUsers() {
    const res = await axios.post(`${BaseURL}/get-users`);
    return {data: await res.data, status: res.status};
}

//------------------------------------------------------------------------------ Project
export async function apiAddProject(project_name = undefined) {
    const res = await axios.post(`${BaseURL}/add-project`, {project_name});
    return {data: await res.data, status: res.status};
}

export async function apiDeleteProject(project_id = undefined) {
    const res = await axios.post(`${BaseURL}/delete-project`, {project_id});
    return {data: await res.data, status: res.status};
}

export async function apiUpdateProject(project_id = undefined, new_name = undefined, position = undefined) {
    const res = await axios.post(`${BaseURL}/update-project`, {project_id, new_name, position});
    return {data: await res.data, status: res.status};
}

export async function apiSearchProjects(searchTerm = undefined) {
    const res = await axios.post(`${BaseURL}/search-projects`, {searchTerm});
    return {data: await res.data, status: res.status};
}

export async function apiGetProjects() {
    const res = await axios.post(`${BaseURL}/get-projects`);
    return {data: await res.data, status: res.status};
}

//------------------------------------------------------------------------------ Priority
export async function apiAddPriority(name = undefined, background_color = undefined, text_color = undefined) {
    const res = await axios.post(`${BaseURL}/add-priority`, {name, background_color, text_color});
    return {data: await res.data, status: res.status};
}

export async function apiUpdatePriority(priority_id = undefined, name = undefined, background_color = undefined, text_color = undefined, position = undefined) {
    const res = await axios.post(`${BaseURL}/update-priority`, {
        priority_id,
        name,
        background_color,
        text_color,
        position
    });
    return {data: await res.data, status: res.status};
}

export async function apiDeletePriority(priority_id = undefined) {
    const res = await axios.post(`${BaseURL}/delete-priority`, {priority_id});
    return {data: await res.data, status: res.status};
}

export async function apiGetPriorities() {
    const res = await axios.post(`${BaseURL}/get-priorities`);
    return {data: await res.data, status: res.status};
}

//------------------------------------------------------------------------------ Tag
export async function apiAddOrUpdateTag(tag = undefined) {
    const res = await axios.post(`${BaseURL}/add-or-update-tag`, tag);
    return {data: await res.data, status: res.status};
}

export async function apiDeleteTag(tag_id = undefined) {
    const res = await axios.post(`${BaseURL}/delete-tag`, {tag_id});
    return {data: await res.data, status: res.status};
}

export async function apiGetTags() {
    const res = await axios.post(`${BaseURL}/get-tags`);
    return {data: await res.data, status: res.status};
}

//------------------------------------------------------------------------------ Status
export async function apiAddOrUpdateStatus(status = undefined) {
    const res = await axios.post(`${BaseURL}/add-or-update-status`, status);
    return {data: await res.data, status: res.status};
}

export async function apiDeleteStatus(status_id = undefined) {
    const res = await axios.post(`${BaseURL}/delete-status`, {status_id});
    return {data: await res.data, status: res.status};
}

export async function apiGetStatus() {
    const res = await axios.post(`${BaseURL}/get-statuses`);
    return {data: await res.data, status: res.status};
}

//------------------------------------------------------------------------------ Task
export async function apiAddOrUpdateTask(task = undefined) {
    const res = await axios.post(`${BaseURL}/add-or-update-task`, task);
    return {data: await res.data, status: res.status};
}

export async function apiDeleteTask(task = undefined) {
    const res = await axios.post(`${BaseURL}/delete-task`, task);
    return {data: await res.data, status: res.status};
}

export async function apiSearchTasks(searchTerm = undefined) {
    const res = await axios.post(`${BaseURL}/search-tasks`, {searchTerm});
    return {data: await res.data, status: res.status};
}

export async function apiGetUserTasks() {
    const res = await axios.post(`${BaseURL}/get-user-tasks`);
    return {data: await res.data, status: res.status};
}

// //------------------------------------------------------------------------------ View
// export async function apiAddPrivateView(title = undefined, data = undefined) {
//     const res = await axios.post(`${BaseURL}/add-private-view`, {title, data});
//     return {data: await res.data, status: res.status};
// }
//
// export async function apiAddPublicView(title = undefined, data = undefined) {
//     const res = await axios.post(`${BaseURL}/add-public-view`, {title, data});
//     return {data: await res.data, status: res.status};
// }
//
// export async function apiGetPrivateViews() {
//     const res = await axios.post(`${BaseURL}/get-private-views`);
//     return {data: await res.data, status: res.status};
// }
//
// export async function apiGetPublicViews() {
//     const res = await axios.post(`${BaseURL}/get-public-views`);
//     return {data: await res.data, status: res.status};
// }
//
// export async function apiGetViewTasks(view_id = undefined) {
//     const res = await axios.post(`${BaseURL}/get-view-tasks`, {view_id});
//     return {data: await res.data, status: res.status};
// }


