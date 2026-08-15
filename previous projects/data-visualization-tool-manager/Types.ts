export type TRange = [number, number, number, number];

export type TDialogDetails = { title: string; message: string };

export type TFindResult = Record<string, IFindItem[]>; // Keyed by row:column

export type TExportOptions = {
    scope: EExportScope;
    format: EExportFormat.CSV;
    delimiter: EExportDelimiter;
} | {
    scope: EExportScope;
    format: EExportFormat.JSON;
    structure: EExportStructure;
} | {
    scope: EExportScope;
    format: EExportFormat.XML;
    structure: EExportStructure;
}

export enum EDownloadUpdateState { None, Downloading, Checking, NetworkError }

export enum EHighlightColor { Orange, Green, Cyan, Blue, Purple, Pink, Red, Redact}

// High-level states the update manager can be in
export enum EUpdateState {
    NoUpdate,
    CheckingForUpdate,
    NetworkError,
    UpdateAvailableButNotDownloaded,
    Downloading,
    DownloadedReadyToInstall
}

export interface IExportDetails {
    ranges?: TRange[],
    options?: TExportOptions,
    fileAddress?: string, //Where to save the exported file
}

// Core data tracked by the update manager
export interface IUpdateData {
    latestVersion?: string;
    downloadUrl?: string;
    storageLocation?: string;
    skippedUpdate?: boolean;
    installNextLaunch?: boolean;
    releaseNotes?: IStartupScreen;
    lastCheckTimestamp?: number;
    isUpdateAvailable?: boolean;
    downloadProgress?: number;
    updateInstalled?: boolean;
}

export enum EStartupScreenType { Welcome, Update }

export enum ELicenseState { Active, Expire}

export enum EAutoUpdateFileChanges { Never, NeedsConfirmation, OnFocus, Always}

export enum EFShortcut { Find, Filter}

export enum ETheme { System, Light, Dark}

export enum ESqlEditorSyntaxHighlighting { Dracula, Light, Monokai}

export enum ERowShading {None, Alternate, OneRow, TwoRow, ThreeRow}

export enum EViewMode { Empty, Grid, Tree}

export enum ESort { None, Ascending, Descending}

export enum ETaskType { Load, Query, Find, Filter, Download, Export}

export enum ETaskState { Started, InProgress, Finished, Canceled, Error}

export enum EEditorState { Idle, InProgress, SyntaxError}

export enum EMessageType {
    UpdateAutoUpdateOff, UpdateAutoUpdateOn
}

export enum EErrorType {
    // Locate
    FileNotFound,
    // Access file
    CannotAccessFile, UnionFeatureUpgradeRequired,
    // Reading
    FileSizeExceedsMemoryWarning, OutOfMemoryError,
    // Parsing
    FileParsingError,
    // Export
    ExportLocationError, ExportFileCreationError,
    // License
    OfflineActivationError, LicenseSeatUnavailable, AccountSignOut, LicenseExpired
}

//Export options
export enum EExportScope {ActiveView, AllViews, Selection}

export enum EExportFormat {CSV, JSON, XML}

export enum EFileFormat {CSV, JSON, XML }

export enum EExportDelimiter {Comma, Tab, Space, Semicolon}

export enum EExportStructure {Minified, Formatted}

// Open URL
export enum EAuthenticationType {None, Basic, Bearer}

export enum EURLCredentialSaveMode {URL, Domain}

export enum EURLValidationResult {
    Ok = 200,
    HTTP_CONTINUE = 100,
    HTTP_SWITCHINGPROTOCOLS = 101,
    HTTP_CREATED = 201,
    HTTP_ACCEPTED = 202,
    HTTP_NONAUTHORIZEDINFO = 203,
    HTTP_NOCONTENT = 204,
    HTTP_RESETCONTENT = 205,
    HTTP_PARTIALCONTENT = 206,
    MULTI_STATUS = 207,
    HTTP_MULTIPLECHOICES = 300,
    HTTP_MOVEDPERMANENTLY = 301,
    HTTP_FOUND = 302,
    HTTP_SEEOTHER = 303,
    HTTP_NOTMODIFIED = 304,
    HTTP_USEPROXY = 305,
    HTTP_TEMPORARYREDIRECT = 307,
    PERMANENT_REDIRECT = 308,
    HTTP_BADREQUEST = 400,
    HTTP_UNAUTHORIZED = 401,
    HTTP_FORBIDDEN = 403,
    HTTP_NOTFOUND = 404,
    HTTP_NOTALLOWED = 405,
    HTTP_NOTACCEPTABLE = 406,
    HTTP_PROXYAUTHREQUIRED = 407,
    HTTP_TIMEOUT = 408,
    HTTP_CONFLICT = 409,
    GONE = 410,
    LENGTH_REQUIRED = 411,
    PRECONDITION_FAILED = 412,
    HTTP_PAYLOADTOOLARGE = 413,
    URI_TOO_LONG = 414,
    UNSUPPORTED_MEDIA_TYPE = 415,
    HTTP_RANGENOTSATISFIABLE = 416,
    HTTP_TEAPOT = 418,
    UPGRADE_REQUIRED = 426,
    HTTP_SERVERERROR = 500,
    HTTP_NOTIMPLEMENTED = 501,
    HTTP_BADGATEWAY = 502,
    HTTP_UNAVAILABLE = 503,
    HTTP_GATEWAYTIMEOUT = 504,
    HTTP_HTTPVERSIONNONSUPPORTED = 505,
    NETWORK_AUTHENTICATION_REQUIRED = 511,
    INVALID_REQUEST = -1, // Represents 'else' category: Cannot connect (Error XXX)
    INVALID_URL = -2, // Represents invalid schema/URL
    REQUEST_TIMED_OUT = -3, // Generic request timed out
    NETWORK_ERROR = -4, // Network error
    CANNOT_CONNECT = -5 // Cannot connect
}

export enum EFilterMode { Refiner, SQL}

export enum ERefinerType { Find, Filter }

export enum EFileSourceTypeEx { None, URL, Local}

export enum EFileSourceType { URL, Local}

export enum EFilePathType { Win, Unix,  URL}

export interface IFindResults {
    [refinerKey: string]: TFindResult;
}

export interface IURLCredentialEx {
    URLCredential: IURLCredential;
    shortenedURL: string;
}

export interface IURLCredential {
    key: string;
    url: string;
    domain?: string;
    saveMode?: EURLCredentialSaveMode;
    authType: EAuthenticationType;
    username?: string;
    password?: string;
    token?: string;
}

export interface IURLParams {
    urlCredential: IURLCredential;
    rememberCredentials: boolean;
}

export interface IFileSegment {
    fullPath: string;
    actualIndex: number;
    count: number;
    parts: string[];
    filePathType: EFilePathType;
    directorySeparator: string;
}

export interface IFileOriginalInfo {
    columns: IColumn[],
    rowCount: number,
    viewMode: EViewMode
}

export interface IFileEx {
    file: IFile;
    shortenedPath: string;
    fileSourceType: EFileSourceTypeEx;
    formattedSize: string; //Size in KB, MB, GB, etc
    lastOpenedTime: string; //Formatted in human-readable style like '17 Feb 2024'
}

export interface IFile {
    key: string;
    currentViewKey: string;
    name: string;
    path: string;
    fileSourceType: EFileSourceType;
    type: string; //csv, json, etc
    size: number; //Size in bytes
    createdAt: number; //Timestamp of created file instance for the first time
    updatedAt: number; //Timestamp of last opened time of the file
    views: IView[];
    authType: EAuthenticationType;
    bannerText?: string;
}

export interface IStartupScreenFeature {
    title: string;
    description: string;
}

export interface IStartupScreen {
    type: EStartupScreenType;
    title: string;
    description: string;
    features: IStartupScreenFeature[];
}

export interface IUserInfo {
    email: string;
    name: string;
    password: string;
}

export interface IUsersInfo {
    Free: IUserInfo;
    Standard: IUserInfo;
    Pro: IUserInfo;
}

export interface ILicense {
    level: number;
    state: ELicenseState;
    title: string;
}

export interface IUser {
    email?: string;
    name?: string;
    password?: string;
}

export interface IAppearanceSettings {
    theme: ETheme;
    sqlEditorSyntaxHighlighting: ESqlEditorSyntaxHighlighting;
    rowShading: ERowShading;
    uiScaling: number; // Percentage value (e.g., 100 for 100%)
}

export interface IGeneralSettings {
    autoUpdateFileChanges: EAutoUpdateFileChanges;
    fShortcut: EFShortcut;
    sendAnonymousAnalytics: boolean;
}

export interface IAboutSettings {
    autoUpdateEnabled: boolean;
    installedVersion: string;
    latestVersion: string;
}

export interface IAccountAndLicense {
    user?: IUser;
    license: ILicense;
}

export interface ISettings {
    accountAndLicense: IAccountAndLicense;
    appearanceSettings: IAppearanceSettings;
    generalSettings: IGeneralSettings;
    aboutSettings: IAboutSettings;
    hardwareID: string;
    updateData: IUpdateData;
    urlCredentialSaveMode: EURLCredentialSaveMode;
}

export interface IColumn {
    key: string;
    index?: number;
    title?: string;
    width?: number;
    sort?: ESort;
    visible?: boolean;
}

export interface IFindItem {
    from: number;
    to: number;
    color: EHighlightColor;
}

export interface ICurrentFind {
    rowIndex?: number;
    colIndex?: number;
    currentFindItemIndex?: number;
    findItems?: IFindItem[][];
}

export interface IRefiner {
    key: string;
    type?: ERefinerType;
    columns?: string[];
    highlight?: EHighlightColor;
    inverse?: boolean;
    content?: string;
    resultCount?: number;
    currentFind?: ICurrentFind;
}

export interface IEditor {
    code?: string;
    state?: EEditorState;
    error?: string;
    moreInfo?: string;
    refiner?: IRefiner;
}

export interface IView {
    key: string;
    name: string;
    filePath: string;
    viewMode: EViewMode;
    filterMode: EFilterMode;
    columns: IColumn[];
    rowCount: number;
    editor: IEditor;
    refiners: IRefiner[];
}

export interface IViewUpdate {
    viewKey: string;
    name?: string;
    filePath?: string;
    viewMode?: EViewMode;
    filterMode?: EFilterMode;
    columns?: IColumn[];
    rowCount?: number;
    editor?: IEditor;
    refiners?: IRefiner[];
}

export interface IViewUpdateEntry {
    key: string;
    name: string;
}

export interface IViewUpdates {
    views: IViewUpdateEntry[];
}

export interface IProgressStep {
    progress: number;
    rowsToGenerate: number;
    timeTaken: number;
}

export interface ITask {
    key: string,
    type: ETaskType,
    label: string,
    info: string,
    description: string,
    time: string,
    state: ETaskState
}

export interface ITaskSummary {
    progressSummary?: number;
    cancelable?: boolean;
    info?: string;
    description?: string;
}

export interface IDataMetric {
    label: string;
    value: string;
}

//Example of status in design:
export interface IStatusUpdate {
    type?: string;
    fileSize?: string;
    info?: string;
    dataMetrics?: IDataMetric[];
    taskSummary?: ITaskSummary;
    tasks?: ITask[];
}

export interface IContentUpdate {
    viewKey?: string,
    range: TRange;
}

export interface IError {
    type: EErrorType;
    title: string;
    message: string;
}

export interface IOpenURLResult {
    isSuccess: boolean;
    urlValidationResult: EURLValidationResult;
    message: string;
}

export interface IMessage {
    type: EMessageType;
    title: string;
    message: string;
}

export interface IErrorLog {
    timestamp: string;
    context: string;
    message: string;
    params: string;
    stack?: string;
}