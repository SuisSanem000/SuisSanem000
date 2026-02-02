import en from '../languages/En.json' assert {type: 'json'};
import {errorCatch, formatFileSize, generateGUID, generateHardwareId, randomInt, valueToLocaleString} from './Utils.ts';
import {csvDataMetricNames, jsonDataMetricNames, recentFilesCount, SIZE_LIMITS, testPaths} from './Constants.ts';
import {
    EAuthenticationType,
    EAutoUpdateFileChanges,
    EEditorState,
    EErrorType,
    EExportDelimiter,
    EExportFormat,
    EExportScope,
    EExportStructure,
    EFileFormat,
    EFilePathType,
    EFileSourceType,
    EFileSourceTypeEx,
    EFilterMode,
    EFShortcut,
    EHighlightColor,
    ELicenseState,
    EMessageType,
    ERowShading,
    ESort,
    ESqlEditorSyntaxHighlighting,
    EStartupScreenType,
    ETaskType,
    ETheme,
    EURLCredentialSaveMode,
    EURLValidationResult,
    EViewMode,
    IColumn,
    IDataMetric,
    IEditor,
    IFile,
    IFileEx,
    IFileSegment,
    IProgressStep,
    IRefiner,
    ISettings,
    IStartupScreen,
    IStartupScreenFeature,
    IView,
    TDialogDetails
} from './Types.ts';
import {generateColumnsFromHeaders} from './InternalFaker.ts';

// Computes the overall performance rate from progress steps.
export function calculateOverallPerformance(steps: IProgressStep[]): number {
    const totalRows: number = steps.reduce((sum: number, step: IProgressStep): number => sum + step.rowsToGenerate, 0);
    const totalTime: number = steps.reduce((sum: number, step: IProgressStep): number => sum + step.timeTaken, 0);
    return Math.round(totalRows / (totalTime / 1000));
}

// This is for task label in each task item in the popup
export function getTaskTypeLabel(taskType: ETaskType): string {
    switch (taskType) {
        case ETaskType.Load:
            return getText('task_type_load');
        case ETaskType.Query:
            return getText('task_type_query');
        case ETaskType.Find:
            return getText('task_type_find');
        case ETaskType.Filter:
            return getText('task_type_filter');
        case ETaskType.Download:
            return getText('task_type_download');
        case ETaskType.Export:
            return getText('task_type_export');
        default:
            return getText('task_type_unknown');
    }
}

//This is for task summary in status bar
export function getTaskTypeDescription(taskType: ETaskType): string {
    switch (taskType) {
        case ETaskType.Load:
            return getText('task_type_load_desc');
        case ETaskType.Query:
            return getText('task_type_query_desc');
        case ETaskType.Find:
            return getText('task_type_find_desc');
        case ETaskType.Filter:
            return getText('task_type_filter_desc');
        case ETaskType.Download:
            return getText('task_type_download_desc');
        case ETaskType.Export:
            return getText('task_type_export_desc');
        default:
            return getText('task_type_unknown_desc');
    }
}

export function getRowShadingDescription(rowShading: ERowShading): string {
    switch (rowShading) {
        case ERowShading.None:
            return getText('row_shading_none');
        case ERowShading.Alternate:
            return getText('row_shading_alternate');
        case ERowShading.OneRow:
            return getText('row_shading_one_row');
        case ERowShading.TwoRow:
            return getText('row_shading_two_row');
        case ERowShading.ThreeRow:
            return getText('row_shading_three_row');
        default:
            return getText('row_shading_unknown');
    }
}

export function getAutoUpdateFileChangesDescription(fileChangeOption: EAutoUpdateFileChanges): string {
    switch (fileChangeOption) {
        case EAutoUpdateFileChanges.Never:
            return getText('auto_update_file_changes_never');
        case EAutoUpdateFileChanges.NeedsConfirmation:
            return getText('auto_update_file_changes_confirmation');
        case EAutoUpdateFileChanges.OnFocus:
            return getText('auto_update_file_changes_focus');
        case EAutoUpdateFileChanges.Always:
            return getText('auto_update_file_changes_always');
        default:
            return getText('auto_update_file_changes_unknown');
    }
}

export function getSortDescription(sort: ESort): string {
    switch (sort) {
        case ESort.None:
            return getText('sort_none');
        case ESort.Ascending:
            return getText('sort_ascending');
        case ESort.Descending:
            return getText('sort_descending');
        default:
            return getText('sort_unknown');
    }
}

export function getHighlightColorDescription(color: EHighlightColor): string {
    switch (color) {
        case EHighlightColor.Orange:
            return getText('highlight_color_orange');
        case EHighlightColor.Green:
            return getText('highlight_color_green');
        case EHighlightColor.Cyan:
            return getText('highlight_color_cyan');
        case EHighlightColor.Blue:
            return getText('highlight_color_blue');
        case EHighlightColor.Purple:
            return getText('highlight_color_purple');
        case EHighlightColor.Pink:
            return getText('highlight_color_pink');
        case EHighlightColor.Red:
            return getText('highlight_color_red');
        case EHighlightColor.Redact:
            return getText('highlight_color_redact');
        default:
            return getText('highlight_color_unknown');
    }
}

export function getFileFormatDescription(fileFormat: EFileFormat): string {
    switch (fileFormat) {
        case EFileFormat.CSV:
            return getText('file_format_csv');
        case EFileFormat.JSON:
            return getText('file_format_json');
        case EFileFormat.XML:
            return getText('file_format_xml');
        default:
            return getText('file_format_unknown');
    }
}

export function getExportScopeDescription(exportScope: EExportScope): string {
    switch (exportScope) {
        case EExportScope.ActiveView:
            return getText('export_scope_active_view');
        case EExportScope.AllViews:
            return getText('export_scope_all_views');
        case EExportScope.Selection:
            return getText('export_scope_selection');
        default:
            return getText('export_scope_unknown');
    }
}

export function getExportFormatDescription(exportFormat: EExportFormat): string {
    switch (exportFormat) {
        case EExportFormat.CSV:
            return getText('export_format_csv');
        case EExportFormat.JSON:
            return getText('export_format_json');
        case EExportFormat.XML:
            return getText('export_format_xml');
        default:
            return getText('export_format_unknown');
    }
}

export function getExportDelimiterDescription(exportDelimiter: EExportDelimiter): string {
    switch (exportDelimiter) {
        case EExportDelimiter.Comma:
            return getText('export_delimiter_comma');
        case EExportDelimiter.Tab:
            return getText('export_delimiter_tab');
        case EExportDelimiter.Space:
            return getText('export_delimiter_space');
        case EExportDelimiter.Semicolon:
            return getText('export_delimiter_semicolon');
        default:
            return getText('export_delimiter_unknown');
    }
}

export function getExportStructureDescription(exportStructure: EExportStructure): string {
    switch (exportStructure) {
        case EExportStructure.Minified:
            return getText('export_structure_minified');
        case EExportStructure.Formatted:
            return getText('export_structure_formatted');
        default:
            return getText('export_structure_unknown');
    }
}

export function getAuthenticationTypeDescription(authenticationType: EAuthenticationType): string {
    switch (authenticationType) {
        case EAuthenticationType.None:
            return getText('auth_type_none');
        case EAuthenticationType.Basic:
            return getText('auth_type_basic');
        case EAuthenticationType.Bearer:
            return getText('auth_type_bearer');
        default:
            return getText('auth_type_unknown');
    }
}

// If the task is load then return false otherwise return true
export function isTaskCancelable(taskType: ETaskType): boolean {
    return (taskType !== ETaskType.Load);
}

export function getErrorDetails(errorType: EErrorType): TDialogDetails | null {
    switch (errorType) {
        case EErrorType.FileNotFound:
            return {
                title: getText('error_file_not_found_title'),
                message: getText('error_file_not_found_message')
            };
        case EErrorType.CannotAccessFile:
            return {
                title: getText('error_cannot_access_file_title'),
                message: getText('error_cannot_access_file_message')
            };
        case EErrorType.UnionFeatureUpgradeRequired:
            return {
                title: getText('error_union_feature_upgrade_required_title'),
                message: getText('error_union_feature_upgrade_required_message')
            };
        case EErrorType.FileSizeExceedsMemoryWarning:
            return {
                title: getText('error_file_size_exceeds_memory_warning_title'),
                message: getText('error_file_size_exceeds_memory_warning_message')
            };
        case EErrorType.OutOfMemoryError:
            return {
                title: getText('error_out_of_memory_error_title'),
                message: getText('error_out_of_memory_error_message')
            };
        case EErrorType.FileParsingError:
            return {
                title: getText('error_file_parsing_error_title'),
                message: getText('error_file_parsing_error_message')
            };
        case EErrorType.ExportLocationError:
            return {
                title: getText('error_export_location_error_title'),
                message: getText('error_export_location_error_message')
            };
        case EErrorType.ExportFileCreationError:
            return {
                title: getText('error_export_file_creation_error_title'),
                message: getText('error_export_file_creation_error_message')
            };
        case EErrorType.LicenseSeatUnavailable:
            return {
                title: getText('error_license_seat_unavailable_title'),
                message: getText('error_license_seat_unavailable_message')
            };
        case EErrorType.AccountSignOut:
            return {
                title: getText('error_account_sign_out_title'),
                message: getText('error_account_sign_out_message')
            };
        case EErrorType.LicenseExpired:
            return {
                title: getText('error_license_expired_title'),
                message: getText('error_license_expired_message')
            };
        case EErrorType.OfflineActivationError:
            return {
                title: getText('error_offline_activation_error_title'),
                message: getText('error_offline_activation_error_message')
            };
        default:
            throw new Error(`Unhandled error type: ${errorType}`);
    }
}

export function getMessageDetails(messageType: EMessageType): TDialogDetails | null {
    switch (messageType) {
        case EMessageType.UpdateAutoUpdateOn:
            return {
                title: getText('message_update_dialogs_auto_update_on_title'),
                message: getText('message_update_dialogs_auto_update_on_message')
            }
        case EMessageType.UpdateAutoUpdateOff:
            return {
                title: getText('message_update_dialogs_auto_update_off_title'),
                message: getText('message_update_dialogs_auto_update_off_message')
            }
        default:
            throw new Error(`Unhandled message type: ${messageType}`);
    }
}

export function getLicenseName(level: number): string {
    return errorCatch((level: number): string => {
        switch (level) {
            case 0:
                return getText('license_name_free');
            case 1:
                return getText('license_name_standard');
            case 2:
                return getText('license_name_pro');
            case 3:
                return getText('license_name_enterprise');
            case 4:
                return getText('license_name_ultimate');
            case 5:
                return getText('license_name_platinum');
            default:
                return getText('license_name_unknown');
        }
    }, 'getLicenseName', ...arguments);
}

export function getLicenseBannerText(requiredLicenseLevel: number): string {
    return errorCatch((requiredLicenseLevel: number): string => {
        const licenseName: string = getLicenseName(requiredLicenseLevel); // Get license name
        const size: string = formatFileSize(SIZE_LIMITS[requiredLicenseLevel]); // Format size properly
        return getText('app_default_license_redacted_banner', licenseName, size);
    }, 'getLicenseBannerText', ...arguments);
}

export function getEmptyView(filePath: string, name: string = 'defaultView'): IView {
    return <IView>{
        key: generateGUID(),
        name: name,
        filePath: filePath,
        viewMode: EViewMode.Grid, //TODO: this should be updated based on file extension
        filterMode: EFilterMode.Refiner,
        editor: {
            code: '',
            state: EEditorState.Idle,
            error: '',
            moreInfo: ''
        },
        columns: generateColumnsFromHeaders(),
        rowCount: 0,
        refiners: []
    };
}

//File
//  Returns a test file object for simulation purposes.
export function getTestFile(fileName: string, filePath: string): IFile {
    return <IFile>{
        key: generateGUID(),
        currentViewKey: '',
        name: fileName,
        path: filePath,
        fileSourceType: isValidURL(filePath) ? EFileSourceType.URL : EFileSourceType.Local,
        type: 'csv',
        size: randomInt(50_000_000, 100_000_000),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        views: [getEmptyView(filePath)],
        authType: EAuthenticationType.None
    };
}

export function appendNumberToFilename(filename: string, number: number): string {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1)
        return `${filename}-${number}`;
    const namePart = filename.substring(0, lastDotIndex);
    const extension = filename.substring(lastDotIndex);
    return `${namePart}-${number}${extension}`;
}

// Reusable helper that formats a numeric timestamp (e.g., from Date.now())
function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function getDirectorySeparator(file: IFile): string {
    return (((file.fileSourceType === EFileSourceType.URL) || (file.path.startsWith('/'))) ? '/' : '\\');
}

export function shortenFilePaths(files: IFile[]): string[] {
    let calculatedPaths: string[] = files.map((f: IFile): string => f.path);

    // Map files to IFileSegment -> normalize paths then generate parts
    const segments: IFileSegment[] = calculatedPaths.map((p: string, i: number): IFileSegment => {
        const normalized: string = p.replace(/\\/g, '/');
        const parts: string [] = normalized.split('/');

        return {
            fullPath: p,
            actualIndex: i,
            count: Math.min(3, parts.length),
            parts: parts,
            filePathType: (files[i].fileSourceType === EFileSourceType.URL) ? EFilePathType.URL : ((files[i].path.startsWith('/')) ? EFilePathType.Unix : EFilePathType.Win),
            directorySeparator: getDirectorySeparator(files[i])
        };
    });

    // Sort segments by parts from last to first item then sort by parts.length
    segments.sort((a: IFileSegment, b: IFileSegment): number => {
        const al: number = a.parts.length;
        const bl: number = b.parts.length;
        const limit: number = Math.min(al, bl);

        for (let i: number = 0; i < limit; i++) {
            if (a.parts[al - i] < b.parts[bl - i])
                return -1;
            if (a.parts[al - i] > b.parts[bl - i])
                return 1;
        }

        if (al < bl)
            return -1;

        if (al > bl)
            return 1;

        return 0;
    });

    //Merge
    let i: number = 1;
    while (i < segments.length) {
        for (let j: number = 0; j < segments[i - 1].parts.length; j++) {
            if (segments[i - 1].parts[segments[i - 1].parts.length - j] === segments[i].parts[segments[i].parts.length - j]) {
                segments[i - 1].count = Math.max(segments[i - 1].count, j + 1);
                segments[i].count = Math.max(segments[i].count, j + 1);
            } else
                break;
        }
        i++;
    }

    // Sort segments by actual index
    segments.sort((a: IFileSegment, b: IFileSegment): number => a.actualIndex - b.actualIndex);

    // Build final paths, based on remained count decide on adding the ... or not
    calculatedPaths = segments.map((s: IFileSegment): string => {
        const sl: number = s.parts.length;
        const keep: number = Math.min(s.count, sl);
        const visibleParts: string[] = s.parts.slice(-keep);

        let p: string = visibleParts.join(s.directorySeparator);

        if ((s.filePathType === EFilePathType.URL) && (sl - s.count <= 2))
            p = '/' + p;

        // add "..." to the front when we trimmed something
        if (s.count < sl)
            p = '...' + s.directorySeparator + p;

        return p;
    });

    return calculatedPaths;
}

export function updateFileSourceTypes(files: IFileEx[]): IFileEx[] {
    if (files.length === 0)
        return [];

    let hasDiff: boolean = false;
    for (const file of files)
        if (file.fileSourceType != files[0].fileSourceType) {
            hasDiff = true;
            break;
        }

    return hasDiff ? files : files.map((fileEx: IFileEx): IFileEx => ({
        ...fileEx,
        fileSourceType: EFileSourceTypeEx.None
    }));
}

//TODO: make it be 500
export function trimStringMiddle(str: string, maxLength: number = 50): string {
    if (str.length <= maxLength) return str;
    const keep: number = Math.floor((maxLength - 3) / 2);
    return str.slice(0, keep) + "..." + str.slice(-keep);
}

export function getCleanRecentFilesList(files: IFile[], recentFilesKeys: string[]): IFileEx[] {
    //Get limited count files
    const limitedKeys: string [] = recentFilesKeys.slice(0, recentFilesCount);
    const filteredFiles: IFile[] = limitedKeys.map((item) => files.find((file) => file.key === item)!);

    //Calculate and assign 'shortenFilePaths' algorithm
    const shortenedPaths: string[] = shortenFilePaths(filteredFiles);

    //Construct 'fileExArray' based on files and assign the original 'fileSourceType'
    let fileExArray: IFileEx[] = filteredFiles.map((file, index) => ({
        file,
        shortenedPath: shortenedPaths[index],
        fileSourceType: (file.fileSourceType === EFileSourceType.URL) ? EFileSourceTypeEx.URL : EFileSourceTypeEx.Local,
        formattedSize: formatFileSize(file.size),
        lastOpenedTime: formatTimestamp(file.updatedAt)
    }));

    // Preserve `EFileSourceTypeEx` if both URL and Local types exist in the array. If only one type is present across all `EFileSourceTypeEx` values, set them all to `None`.
    return updateFileSourceTypes(fileExArray);
}

//Open URL functions
// Validate URL format
export function isValidURL(url: string): boolean {
    return errorCatch((url: string): boolean => {
        try {
            const parsed = new URL(url);
            return (parsed.protocol === 'http:' || parsed.protocol === 'https:');
        } catch (error) {
            return false;
        }
    }, 'isValidURL', ...arguments);
}

export function getURLValidationResultDetails(result: EURLValidationResult): string {
    switch (result) {
        case EURLValidationResult.Ok:
            return getText('http_status_200_connected');
        case EURLValidationResult.HTTP_CONTINUE:
            return getText('http_status_100_continue');
        case EURLValidationResult.HTTP_SWITCHINGPROTOCOLS:
            return getText('http_status_101_switching_protocols');
        case EURLValidationResult.HTTP_CREATED:
            return getText('http_status_201_created');
        case EURLValidationResult.HTTP_ACCEPTED:
            return getText('http_status_202_accepted');
        case EURLValidationResult.HTTP_NONAUTHORIZEDINFO:
            return getText('http_status_203_non_authoritative_info');
        case EURLValidationResult.HTTP_NOCONTENT:
            return getText('http_status_204_no_content');
        case EURLValidationResult.HTTP_RESETCONTENT:
            return getText('http_status_205_reset_content');
        case EURLValidationResult.HTTP_PARTIALCONTENT:
            return getText('http_status_206_partial_content');
        case EURLValidationResult.MULTI_STATUS:
            return getText('http_status_207_multi_status');
        case EURLValidationResult.HTTP_MULTIPLECHOICES:
            return getText('http_status_300_multiple_choices');
        case EURLValidationResult.HTTP_MOVEDPERMANENTLY:
            return getText('http_status_301_moved_permanently');
        case EURLValidationResult.HTTP_FOUND:
            return getText('http_status_302_found');
        case EURLValidationResult.HTTP_SEEOTHER:
            return getText('http_status_303_see_other');
        case EURLValidationResult.HTTP_NOTMODIFIED:
            return getText('http_status_304_not_modified');
        case EURLValidationResult.HTTP_USEPROXY:
            return getText('http_status_305_use_proxy');
        case EURLValidationResult.HTTP_TEMPORARYREDIRECT:
            return getText('http_status_307_temporary_redirect');
        case EURLValidationResult.PERMANENT_REDIRECT:
            return getText('http_status_308_permanent_redirect');
        case EURLValidationResult.HTTP_BADREQUEST:
            return getText('http_status_400_bad_request');
        case EURLValidationResult.HTTP_UNAUTHORIZED:
            return getText('http_status_401_unauthorized');
        case EURLValidationResult.HTTP_FORBIDDEN:
            return getText('http_status_403_forbidden');
        case EURLValidationResult.HTTP_NOTFOUND:
            return getText('http_status_404_not_found');
        case EURLValidationResult.HTTP_NOTALLOWED:
            return getText('http_status_405_method_not_allowed');
        case EURLValidationResult.HTTP_NOTACCEPTABLE:
            return getText('http_status_406_not_acceptable');
        case EURLValidationResult.HTTP_PROXYAUTHREQUIRED:
            return getText('http_status_407_proxy_auth_required');
        case EURLValidationResult.HTTP_TIMEOUT:
            return getText('http_status_408_request_timeout');
        case EURLValidationResult.HTTP_CONFLICT:
            return getText('http_status_409_conflict');
        case EURLValidationResult.GONE:
            return getText('http_status_410_gone');
        case EURLValidationResult.LENGTH_REQUIRED:
            return getText('http_status_411_length_required');
        case EURLValidationResult.PRECONDITION_FAILED:
            return getText('http_status_412_pre_condition_failed');
        case EURLValidationResult.HTTP_PAYLOADTOOLARGE:
            return getText('http_status_413_payload_too_large');
        case EURLValidationResult.URI_TOO_LONG:
            return getText('http_status_414_uri_too_long');
        case EURLValidationResult.UNSUPPORTED_MEDIA_TYPE:
            return getText('http_status_415_unsupported_media_type');
        case EURLValidationResult.HTTP_RANGENOTSATISFIABLE:
            return getText('http_status_416_range_not_satisfiable');
        case EURLValidationResult.HTTP_TEAPOT:
            return getText('url_validation_teapot');
        case EURLValidationResult.UPGRADE_REQUIRED:
            return getText('http_status_426_upgrade_required');
        case EURLValidationResult.HTTP_SERVERERROR:
            return getText('http_status_500_internal_server_error');
        case EURLValidationResult.HTTP_NOTIMPLEMENTED:
            return getText('http_status_501_not_implemented');
        case EURLValidationResult.HTTP_BADGATEWAY:
            return getText('http_status_502_bad_gateway');
        case EURLValidationResult.HTTP_UNAVAILABLE:
            return getText('http_status_503_service_unavailable');
        case EURLValidationResult.HTTP_GATEWAYTIMEOUT:
            return getText('http_status_504_gateway_timeout');
        case EURLValidationResult.HTTP_HTTPVERSIONNONSUPPORTED:
            return getText('http_status_505_http_version_not_supported');
        case EURLValidationResult.NETWORK_AUTHENTICATION_REQUIRED:
            return getText('http_status_511_network_auth_required');
        case EURLValidationResult.INVALID_REQUEST:
            return getText('url_validation_invalid_request');
        case EURLValidationResult.INVALID_URL:
            return getText('url_validation_invalid_url');
        case EURLValidationResult.REQUEST_TIMED_OUT:
            return getText('url_validation_request_timed_out');
        case EURLValidationResult.NETWORK_ERROR:
            return getText('url_validation_network_error');
        case EURLValidationResult.CANNOT_CONNECT:
            return getText('url_validation_cannot_connect');
        default:
            return getText('url_validation_unknown');
    }
}

export function getValidationResult(input?: number): EURLValidationResult {
    // TODO: This is just for testing UI, to return Ok in case input is 1
    if (input && input === 1)
        return EURLValidationResult.Ok;

    // Filter out values in the success range (200–299)
    const enumValues = Object.values(EURLValidationResult).filter(
        value => typeof value === 'number' && (value < 200 || value >= 300)
    ) as EURLValidationResult[];

    // Pick a random non-success value
    const randomIndex = Math.floor(Math.random() * enumValues.length);
    return enumValues[randomIndex];
}

export function isStatusOk(status: EURLValidationResult): boolean {
    return status >= 200 && status < 300;
}

export function getDefaultSettings(): ISettings {
    return {
        accountAndLicense: {
            user: undefined,
            license: {
                level: 0,
                state: ELicenseState.Active,
                title: getText('app_default_license_name')
            }
        },
        appearanceSettings: {
            theme: ETheme.System,
            sqlEditorSyntaxHighlighting: ESqlEditorSyntaxHighlighting.Dracula,
            rowShading: ERowShading.OneRow,
            uiScaling: 100
        },
        generalSettings: {
            autoUpdateFileChanges: EAutoUpdateFileChanges.Always,
            fShortcut: EFShortcut.Find,
            sendAnonymousAnalytics: true
        },
        aboutSettings: {
            autoUpdateEnabled: true,
            installedVersion: getText('app_info_installed_version'),
            latestVersion: getText('app_info_latest_version')
        },
        hardwareID: generateHardwareId(),
        updateData: {
            latestVersion: getText('app_info_latest_version'),
            downloadUrl: getText('app_info_update_download_url'),
            storageLocation: undefined,
            skippedUpdate: undefined,
            installNextLaunch: undefined,
            releaseNotes: <IStartupScreen>{
                type: EStartupScreenType.Update,
                title: getText('startup_dialog_update_title'),
                description: getText('startup_dialog_update_description'),
                features: [
                    <IStartupScreenFeature>{
                        title: getText('startup_dialog_update_feature_1_title'),
                        description: getText('startup_dialog_update_feature_1_description')
                    }, <IStartupScreenFeature>{
                        title: getText('startup_dialog_update_feature_2_title'),
                        description: getText('startup_dialog_update_feature_2_description')
                    }, <IStartupScreenFeature>{
                        title: getText('startup_dialog_update_feature_3_title'),
                        description: getText('startup_dialog_update_feature_3_description')
                    }, <IStartupScreenFeature>{
                        title: getText('startup_dialog_update_feature_4_title'),
                        description: getText('startup_dialog_update_feature_4_description')
                    }
                ]
            },
            lastCheckTimestamp: Date.now(),
            isUpdateAvailable: undefined,
            downloadProgress: undefined
        },
        urlCredentialSaveMode: EURLCredentialSaveMode.URL
    };
}

// checks if the word 'active' exists in the file data
export async function checkOfflineActivation(file: File): Promise<boolean> {
    const text: string = await file.text();
    return text.includes('active');
}

// Example usage: v5.135(5413) -> v6.135(5413)
export function updateVersion(version: string): string {
    return errorCatch((version: string): string => {
        const match = version.match(/^v(\d+)\.(.*)$/); // Use regex to match the pattern 'v<number>.'
        if (!match)
            throw new Error(`Error in updateVersion; Invalid version format; version: ${version}`);
        const versionNumber = parseInt(match[1], 10); // Extract the number after 'v'
        return `v${versionNumber + 1}.${match[2]}`;    // Increment the version number and reassemble the string
    }, 'updateVersion', ...arguments);
}


export function generateRandomDataMetrics(fileFormat: EFileFormat, size: number): IDataMetric[] {
    let metricNames: string[] = [];

    switch (fileFormat) {
        case EFileFormat.JSON:
            metricNames = jsonDataMetricNames;
            break;
        case EFileFormat.CSV:
            metricNames = csvDataMetricNames;
            break;
        case EFileFormat.XML:
            return [];
        default:
            return [];
    }

    return metricNames.map((name, index) => {
        const value: string = (index == 0) ? valueToLocaleString(size) : valueToLocaleString(randomInt(1, 500_000));
        return {label: name, value};
    });
}

export function clearRefinerResultFields(file: IFile): IFile {
    file.views.forEach((view) => {
        view.refiners.forEach((refiner) => {
            refiner.resultCount = undefined;
            refiner.currentFind = undefined;
        });
    });
    return file;
}

// Use getText(key, ...params) to retrieve string values; provide params for placeholders (e.g., getText('error_cannot_connect_code', '500') → //Cannot connect. (Error 500)
export function getText(name: keyof typeof en, ...value: string[]): string {
    return errorCatch((name: keyof typeof en, ...value: string[]): string => {
        let text: string = en[name];
        text = text.replace(/{(\d+)}/g, (match, number) => {
            if (number >= value.length)
                throw new Error(`Error in getText; Missing value for formatting key: ${name}`);
            return value[number];
        });
        return text;
    }, 'getText', ...arguments);
}

//Clone by new keys
export function cloneColumn(column: IColumn): IColumn {
    return {...column, key: generateGUID()};
}

export function cloneRefiner(refiner: IRefiner): IRefiner {
    const {resultCount, currentFind, ...rest} = refiner;
    return {...rest, key: generateGUID()};
}

export function cloneEditor(editor: IEditor): IEditor {
    return <IEditor>{
        ...editor,
        key: generateGUID(),
        ...(editor.refiner !== undefined ? {refiner: cloneRefiner(editor.refiner)} : {})
    };
}

export function cloneView(view: IView): IView {
    return {
        ...view,
        key: generateGUID(),
        ...(view.refiners.length > 0 ? {refiners: view.refiners.map(cloneRefiner)} : {}),
        ...(view.columns.length > 0 ? {columns: view.columns.map(cloneColumn)} : {}),
        ...(view.editor !== undefined ? {editor: cloneEditor(view.editor)} : {})
    };
}

//This function is going to have a default view mode for each file format like grid for csv and tree for json, and so on.
export function getFileTypeViewMode(fileFormat: EFileFormat): EViewMode {
    switch (fileFormat) {
        case EFileFormat.CSV:
            return EViewMode.Grid;
        case EFileFormat.XML:
            return EViewMode.Tree;
        case EFileFormat.JSON:
            return EViewMode.Tree;
        default:
            return EViewMode.Empty;
    }
}