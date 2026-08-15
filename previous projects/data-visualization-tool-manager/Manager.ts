import {
    EAuthenticationType,
    EAutoUpdateFileChanges,
    EDownloadUpdateState,
    EEditorState,
    EErrorType,
    EFileFormat,
    EFilterMode,
    EFShortcut,
    EHighlightColor,
    ELicenseState,
    EMessageType,
    ERefinerType,
    ERowShading,
    ESort,
    ESqlEditorSyntaxHighlighting,
    EStartupScreenType,
    ETaskState,
    ETaskType,
    ETheme,
    EUpdateState,
    EURLCredentialSaveMode,
    EURLValidationResult,
    EViewMode,
    IColumn,
    IContentUpdate,
    ICurrentFind,
    IEditor,
    IError,
    IExportDetails,
    IFile,
    IFileEx,
    IFileOriginalInfo,
    IFindItem,
    IFindResults,
    ILicense,
    IMessage,
    IOpenURLResult,
    IProgressStep,
    IRefiner,
    ISettings,
    IStartupScreen,
    IStartupScreenFeature,
    IStatusUpdate,
    ITask,
    ITaskSummary,
    IURLCredential,
    IURLCredentialEx,
    IURLParams,
    IUserInfo,
    IUsersInfo,
    IView,
    IViewUpdate,
    IViewUpdates,
    TDialogDetails,
    TFindResult,
    TRange
} from './Types.ts';

import {
    appendNumberToFilename,
    calculateOverallPerformance,
    checkOfflineActivation,
    clearRefinerResultFields,
    cloneRefiner,
    cloneView,
    generateRandomDataMetrics,
    getCleanRecentFilesList,
    getDefaultSettings,
    getErrorDetails,
    getFileFormatDescription,
    getFileTypeViewMode,
    getLicenseBannerText,
    getLicenseName,
    getMessageDetails,
    getTaskTypeDescription,
    getTaskTypeLabel,
    getTestFile,
    getText,
    getURLValidationResultDetails,
    getValidationResult,
    isStatusOk,
    isTaskCancelable,
    isValidURL,
    trimStringMiddle,
    updateVersion
} from './Helpers.ts';

import {
    copyToClipboard,
    delay,
    errorCatch,
    errorCatchAsync,
    extractDomain,
    formatFileSize,
    generateGUID,
    getFromClipboard,
    getRandomNumberInRange,
    insertIntoArray,
    loadFromLocalStorage,
    openMailApp,
    randomInt,
    saveToLocalStorage,
    updateOrAddItemWithKey
} from './Utils.ts';

import {
    currentFileFormat,
    redactChar,
    sampleFileName,
    sampleFilePath,
    sampleFileRowCount,
    sampleURLPath,
    SIZE_LIMITS,
    updateIntervalInMS
} from './Constants.ts';

import {generateColumnsFromHeaders, generateDynamicProgressSteps, populateProductCSVData} from './InternalFaker.ts';

export interface IManagerEventMap {
    'startupScreen': CustomEvent<IStartupScreen>;
    'updateLicense': CustomEvent<ILicense>;
    'updateView': CustomEvent<IViewUpdate>;
    'updateViewSync': CustomEvent<IViewUpdate>;
    'updateViews': CustomEvent<IViewUpdates>;
    'updateStatus': CustomEvent<IStatusUpdate>;
    'updateContent': CustomEvent<IContentUpdate>;
    'updateSettings': CustomEvent<ISettings>;
    'updateSettingsSync': CustomEvent<ISettings>;
    'error': CustomEvent<IError>;
    'openURLResult': CustomEvent<IOpenURLResult>;
    'message': CustomEvent<IMessage>;
}

// TManager handles various functionalities, including: Startup processes, Data handling, User interaction, Settings, and Events.
export class TManager extends EventTarget {
    private tasks: ITask[] = [];
    private files: IFile[];
    private currentFile?: IFile;
    private currentView?: IView;
    private products: string[][] = [];
    private previousProductsSnapshot?: string[][]; //Used only in execute and terminate query
    private currentFileOriginalInfo?: IFileOriginalInfo;

    //These are filled in constructor
    private readonly settings: ISettings;
    private downloadUpdateState: EDownloadUpdateState = EDownloadUpdateState.None;
    private startupScreenType: EStartupScreenType;
    private openCount: number; //This is used for showing startup screens
    private activeRefinerKey?: string;
    private currentQueryTaskKey?: string; //This is used for checking in terminate query
    private findResults: IFindResults = {}; // Store find results for all refiners

    //These events configuration added bt T is about a bug in typescript for managing event types in suggestions
    addEventListener(type: 'startupScreen' | 'updateLicense' | 'updateView' | 'updateViewSync' | 'updateViews' | 'updateStatus' | 'updateContent' | 'updateSettings' | 'updateSettingsSync' | 'error' | 'openURLResult' | 'message', listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof IManagerEventMap>(type: K, listener: (this: TManager, ev: IManagerEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;
    addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void {
        super.addEventListener(type, callback, options);
    }

    removeEventListener(type: 'startupScreen' | 'updateLicense' | 'updateView' | 'updateViewSync' | 'updateViews' | 'updateStatus' | 'updateContent' | 'updateSettings' | 'updateSettingsSync' | 'error' | 'openURLResult' | 'message', listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof IManagerEventMap>(type: K, listener: (this: TManager, ev: IManagerEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): void;
    removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): void {
        super.removeEventListener(type, callback, options);
    }

    //Get main objects helper functions
    private getViewByKeyOrFail(viewKey: string, file: IFile | undefined = undefined): IView {
        return errorCatch((viewKey: string, file: IFile | undefined = undefined): IView => {
            const f: IFile = file ?? this.getCurrentFileOrFail();
            const view: IView | undefined = f.views.find((v: IView): boolean => v.key === viewKey);
            if (view === undefined)
                throw new Error(`Error in getViewByKeyOrFail; No view found for viewKey: ${viewKey}`);
            return view;
        }, 'getViewByKeyOrFail', ...arguments);
    }

    //Works on the current view only
    private getRefinerByKeyOrFail(refinerKey: string, view: IView | undefined = undefined): IRefiner {
        return errorCatch((refinerKey: string, view: IView | undefined = undefined): IRefiner => {
            const v: IView = view ?? this.getCurrentViewOrFail();
            const refiner: IRefiner | undefined = (v.editor?.refiner?.key === refinerKey) ? (v.editor.refiner) : (v.refiners.find(r => r.key === refinerKey))
            if (refiner === undefined)
                throw new Error(`Error in getRefinerByKeyOrFail; No refiner found for refinerKey: ${refinerKey}`);
            return refiner;
        }, 'getRefinerByKeyOrFail', ...arguments);
    }

    private getCurrentFileOrFail(): IFile {
        return errorCatch((): IFile => {
            if (this.currentFile === undefined)
                throw new Error(`Error in getCurrentFileOrFail; this.currentFile is undefined`);
            return this.currentFile;
        }, 'getCurrentFileOrFail', ...arguments);
    }

    private getCurrentViewOrFail(): IView {
        return errorCatch((): IView => {
            if (this.currentView === undefined)
                throw new Error(`Error in getCurrentViewOrFail; this.currentView is undefined`);
            return this.currentView;
        }, 'getCurrentViewOrFail', ...arguments);
    }

    private doGetCurrentViewMode(): EViewMode {
        return errorCatch((): EViewMode => {
            let vm: EViewMode = EViewMode.Empty;
            if (this.currentFile !== undefined && this.currentView !== undefined)
                vm = this.currentView.viewMode;
            return vm;
        }, 'doGetCurrentViewMode', ...arguments);
    }

    //Tasks
    // Adds a new task or updates an existing one based on the key.
    private addOrUpdateTask(newTask: ITask) {
        errorCatch((newTask: ITask): void => {
            if (this.tasks === undefined)
                throw new Error(`Error in addOrUpdateTask; this.tasks is undefined`);
            const taskIndex: number = this.tasks.findIndex(task => task.key === newTask.key);
            if (taskIndex === -1)
                this.tasks.push(newTask);
            else
                this.tasks[taskIndex] = newTask; //?? check after task cancelation
        }, 'addOrUpdateTask', ...arguments);
    }

    private doCancelTask(task: ITask) {
        errorCatch((task: ITask) => {
            task.state = ETaskState.Canceled;

            // Update task state and selectively update the task array
            const updatedTasks: ITask[] = updateOrAddItemWithKey(
                this.tasks,
                {key: task.key, state: task.state} as Partial<ITask>,
                'key'
            );

            // Dispatch updated tasks
            const su: IStatusUpdate = {tasks: updatedTasks};
            this.dispatchEvent(new CustomEvent<IStatusUpdate>('updateStatus', {detail: su}));
        }, 'doCancelTask', ...arguments);
    }

    //Views
    private dispatchUpdateViews() {
        errorCatch(() => {
            const vu: IViewUpdates = {views: this.getCurrentFileOrFail().views.map(v => ({key: v.key, name: v.name}))};
            this.dispatchEvent(new CustomEvent<IViewUpdates>('updateViews', {detail: vu}));
        }, 'dispatchUpdateViews', ...arguments);
    }

    private updateEmptyView() {
        const vu: IViewUpdate = <IViewUpdate>{viewKey: '', viewMode: EViewMode.Empty};
        this.dispatchEvent(new CustomEvent<IViewUpdate>('updateView', {detail: vu}));
        this.dispatchEvent(new CustomEvent<IViewUpdate>('updateViewSync', {detail: vu}));
    }

    //Columns
    private doGetColumnByKey(columnKey: string, view: IView | undefined = undefined): IColumn {
        return errorCatch((columnKey: string, view: IView | undefined = undefined): IColumn => {
            const v: IView = view ?? this.getCurrentViewOrFail();
            const column: IColumn | undefined = v.columns.find(c => c.key === columnKey);
            if (column === undefined)
                throw new Error(`Error in doGetColumnByKey; No column found for columnKey: ${columnKey}`);
            return column;
        }, 'doGetColumnByKey', ...arguments);
    }

    private dispatchUpdateViewColumns(partialColumn: Partial<IColumn>, view: IView | undefined = undefined) {
        errorCatch((partialColumn: Partial<IColumn>, view: IView | undefined = undefined) => {
            const v: IView = view ?? this.getCurrentViewOrFail();
            const updatedColumns: IColumn[] = updateOrAddItemWithKey(v.columns, partialColumn as Partial<IColumn>, 'key');
            const vu: IViewUpdate = {viewKey: v.key, columns: updatedColumns};
            this.dispatchEvent(new CustomEvent<IViewUpdate>('updateViewSync', {detail: vu}));
            saveToLocalStorage('files', this.files);
        }, 'dispatchUpdateViewColumns', ...arguments);
    }

    private dispatchUpdateViewEditor(editor: IEditor) {
        errorCatch((editor: IEditor) => {
            const vu: IViewUpdate = {viewKey: this.getCurrentViewOrFail().key, editor: editor};
            this.dispatchEvent(new CustomEvent<IViewUpdate>('updateView', {detail: vu}));
            this.dispatchEvent(new CustomEvent<IViewUpdate>('updateViewSync', {detail: vu}));

            //When changing an editor we want changes to be synced with local storage
            saveToLocalStorage('files', this.files);
        }, 'dispatchUpdateViewEditor', ...arguments);
    }

    private updateViewForEditor(editor: IEditor) {
        errorCatch((editor: IEditor) => {
            const vu: IViewUpdate = {viewKey: this.getCurrentViewOrFail().key, editor: editor};
            this.dispatchEvent(new CustomEvent<IViewUpdate>('updateViewSync', {detail: vu}));

            //When changing an editor we want changes to be synced with local storage
            saveToLocalStorage('files', this.files);
        }, 'updateViewForEditor', ...arguments);
    }

    //Files
    private doSetCurrentFile(file: IFile): void {
        this.currentFile = file;
        saveToLocalStorage('files', this.files);
    }

    private doSetCurrentView(viewKey: string, view: IView | undefined = undefined): void {
        errorCatch((viewKey: string, view: IView | undefined) => {
            if (this.currentFile === undefined)
                throw new Error('Error in doSetCurrentView; this.currentFile is undefined');
            this.currentFile.currentViewKey = view ? view.key : viewKey;
            this.currentView = view ?? this.currentFile.views.find((v: IView): boolean => v.key === viewKey);
            saveToLocalStorage('files', this.files);
        }, 'doSetCurrentView', ...arguments);
    }

    private addOrUpdateFile(file: IFile) {
        errorCatch((file: IFile) => {
            const fileIndex: number = this.files.findIndex(f => f.key === file.key);
            if (fileIndex === -1)
                this.files.push(file)
            else
                this.files[fileIndex] = file;

            saveToLocalStorage('files', this.files);
        }, 'addOrUpdateFile', ...arguments);
    }

    private updateRecentFileList(fileKey: string) {
        errorCatch((fileKey: string) => {
            const recentFilesKeys: string[] = loadFromLocalStorage('recentFilesKeys') || [];
            const index: number = recentFilesKeys.indexOf(fileKey);
            if (index !== -1)
                recentFilesKeys.splice(index, 1);
            insertIntoArray(recentFilesKeys, fileKey, 'top');
            saveToLocalStorage('recentFilesKeys', recentFilesKeys);
        }, 'updateRecentFileList', ...arguments);
    }

    //Simulates loading a file and dynamically populates data in steps, then dispatch tasks events
    private async openFileSimulation(fileName: string, filePath: string): Promise<void> {
        return await errorCatchAsync(async (fileName: string, filePath: string): Promise<void> => {
            let totalTimeTaken: number = 0;
            let totalRows: number = 0;
            let file: IFile | undefined;
            let su: IStatusUpdate, vu: IViewUpdate, cu: IContentUpdate;

            // check if the file already exists
            file = this.files.find(f => f.name == fileName); //todo fix path
            if (file === undefined) {
                file = getTestFile(fileName, filePath);

                //For testing purposes, make second sample file be having large size to demonstrate redact
                if ((this.openCount % 3 === 1) && (fileName !== sampleFileName))
                    file.size = randomInt(33_000_000_000, 63_000_000_000);
            }

            file.updatedAt = Date.now();
            this.currentFileOriginalInfo = {
                columns: generateColumnsFromHeaders(),
                rowCount: sampleFileRowCount,
                viewMode: getFileTypeViewMode(EFileFormat.CSV)
            }

            clearRefinerResultFields(file);
            this.addOrUpdateFile(file);
            this.updateRecentFileList(file.key);
            this.doSetCurrentFile(file);
            file.currentViewKey = file.currentViewKey || file.views[0].key;
            this.doSetCurrentView(file.currentViewKey);
            this.updateLicenseInfo(this.settings.accountAndLicense.license, file);

            //Step 1: Update the views of the file first then dispatch the 'updateView' event after 200 ms
            await delay(100);
            const view: IView = this.getViewByKeyOrFail(file.currentViewKey, file);
            view.viewMode = EViewMode.Grid; //TODO: consider setting tree as well
            view.rowCount = totalRows;
            saveToLocalStorage('files', this.files); //Update files because the views of the current opened files is changing

            //Reset refiners of all the views of the file (including the editor's refiner)
            file.views.forEach((v: IView) => {
                v.refiners.forEach((r: IRefiner) => this.resetRefinerResults(r.key, v));
                if ((v.filterMode === EFilterMode.SQL) && (v.editor.refiner !== undefined))
                    this.resetRefinerResults(v.editor.refiner.key, v);
            });

            vu = {
                viewKey: view.key,
                name: view.name,
                filePath: view.filePath,
                viewMode: view.viewMode,
                filterMode: view.filterMode,
                columns: view.columns,
                rowCount: view.rowCount,
                editor: view.editor,
                refiners: view.refiners
            };

            this.dispatchEvent(new CustomEvent<IViewUpdate>('updateView', {detail: vu}));
            this.dispatchEvent(new CustomEvent<IViewUpdate>('updateViewSync', {detail: vu}));

            this.dispatchUpdateViews();

            //Step 2: Initialize loadTask and status bar
            let loadTask: ITask = {
                key: generateGUID(),
                type: ETaskType.Load,
                label: getTaskTypeDescription(ETaskType.Load),
                info: getText('task_type_waiting_desc'),
                description: getText('formatted_percent', (0).toString()),
                time: getText('formatted_time_ms', (0).toLocaleString()),
                state: ETaskState.Started
            };
            this.addOrUpdateTask(loadTask);

            if (this.tasks === undefined)
                throw new Error(`Error in openFileSimulation; this.tasks is undefined`);

            let updatedTasks: ITask[] = updateOrAddItemWithKey(
                this.tasks,
                {
                    key: loadTask.key,
                    type: loadTask.type,
                    label: loadTask.label,
                    info: loadTask.info,
                    description: loadTask.description,
                    time: loadTask.time,
                    state: loadTask.state
                } as Partial<ITask>,
                'key'
            );

            su = {
                type: getFileFormatDescription(currentFileFormat),
                fileSize: formatFileSize(this.getCurrentFileOrFail().size),
                dataMetrics: generateRandomDataMetrics(currentFileFormat, this.getCurrentFileOrFail().size),
                taskSummary: <ITaskSummary>{
                    progressSummary: 0,
                    cancelable: isTaskCancelable(ETaskType.Load),
                    info: getTaskTypeDescription(ETaskType.Load),
                    description: (this.tasks.length > 1) ? loadTask.info + ` (${this.tasks.length}/${this.tasks.length})` : loadTask.info
                },
                tasks: updatedTasks
            };
            this.dispatchEvent(new CustomEvent<IStatusUpdate>('updateStatus', {detail: su}));
            await delay(100);

            //Progress steps
            const progressSteps: IProgressStep[] = generateDynamicProgressSteps(sampleFileRowCount, 10);
            for (let index: number = 0; index < progressSteps.length; index++) {
                const step: IProgressStep = progressSteps[index];
                totalTimeTaken += step.timeTaken;
                await delay(step.timeTaken);
                this.generateAndAddProducts(step.rowsToGenerate);
                totalRows += step.rowsToGenerate;

                // Update status
                loadTask = <ITask>{
                    ...loadTask,
                    label: getTaskTypeLabel(ETaskType.Load),
                    info: getText('formatted_info_rows_scanned', (totalRows).toLocaleString()),
                    description: getText('formatted_percent', (step.progress).toString()),
                    time: getText('formatted_time_ms', (totalTimeTaken).toLocaleString()),
                    state: ETaskState.InProgress
                };
                this.addOrUpdateTask(loadTask);

                updatedTasks = updateOrAddItemWithKey(
                    this.tasks,
                    {
                        key: loadTask.key,
                        label: loadTask.label,
                        info: loadTask.info,
                        description: loadTask.description,
                        time: loadTask.time,
                        state: loadTask.state
                    } as Partial<ITask>,
                    'key'
                );

                su = {
                    info: `${(view.columns.length).toLocaleString()} x ${(totalRows).toLocaleString()}`,
                    taskSummary: <ITaskSummary>{
                        progressSummary: step.progress,
                        description: (this.tasks.length > 1) ? loadTask.info + ` (${this.tasks.length}/${this.tasks.length})` : loadTask.info
                    },
                    tasks: updatedTasks
                };
                this.dispatchEvent(new CustomEvent<IStatusUpdate>('updateStatus', {detail: su}));

                // Update content
                cu = {
                    viewKey: file.currentViewKey,
                    range: [totalRows - step.rowsToGenerate, 0, totalRows - 1, view.columns.length - 1]
                };
                this.dispatchEvent(new CustomEvent<IContentUpdate>('updateContent', {detail: cu}));

                // Update view
                view.rowCount = totalRows;
                saveToLocalStorage('files', this.files);
                const vu = {viewKey: view.key, rowCount: totalRows};
                this.dispatchEvent(new CustomEvent<IViewUpdate>('updateView', {detail: vu}));
                this.dispatchEvent(new CustomEvent<IViewUpdate>('updateViewSync', {detail: vu}));
            } //Progress steps finished

            // Update status for finish step
            loadTask = <ITask>{
                ...loadTask,
                label: getTaskTypeLabel(ETaskType.Load),
                info: getText('formatted_info_rows_scanned', (totalRows).toLocaleString()),
                description: getText('formatted_description_rows_no_parenthesis', (calculateOverallPerformance(progressSteps)).toLocaleString()),
                time: getText('formatted_time_ms', (progressSteps.reduce((sum, step) => sum + step.timeTaken, 0)).toLocaleString()),
                state: ETaskState.Finished
            };
            this.addOrUpdateTask(loadTask);

            updatedTasks = updateOrAddItemWithKey(
                this.tasks,
                {
                    key: loadTask.key,
                    label: getTaskTypeLabel(ETaskType.Load),
                    info: loadTask.info,
                    description: loadTask.description,
                    time: loadTask.time,
                    state: loadTask.state
                } as Partial<ITask>,
                'key'
            );

            su = {
                info: `${(view.columns.length).toLocaleString()} x ${(totalRows).toLocaleString()}`,
                taskSummary: <ITaskSummary>{
                    info: getText('formatted_info_rows_scanned', (totalRows).toLocaleString()),
                    description: getText('formatted_description_rows', (calculateOverallPerformance(progressSteps)).toLocaleString())
                },
                tasks: updatedTasks
            };

            this.dispatchEvent(new CustomEvent<IStatusUpdate>('updateStatus', {detail: su}));
            await this.doViewRefiners(view, false); //Do refiners process after open file to update UI based on new finds and filters
        }, 'openFileSimulation', ...arguments);
    }

    private doClearRecentFiles() {
        errorCatch(() => {
            saveToLocalStorage('recentFilesKeys', []);
            this.files = [];
            saveToLocalStorage('files', this.files);
        }, 'doClearRecentFiles', ...arguments);
    }

    private async doOpenFileByKey(fileKey: string): Promise<void> {
        return await errorCatchAsync(async (fileKey: string): Promise<void> => {
            if (this.files === undefined)
                throw new Error(`Error in doOpenFileByKey; this.files is undefined. fileKey: ${fileKey}`);
            const file: IFile | undefined = this.files.find(f => f.key === fileKey);
            if (file === undefined)
                throw new Error(`Error in openRecentFile; no file for fileKey: ${fileKey}`);
            return await this.openFileSimulation(file.name, file.path);
        }, 'doOpenFileByKey', ...arguments);
    }

    private async doExportFile(exportDetails: IExportDetails): Promise<void> {
        return await errorCatchAsync(async (exportDetails: IExportDetails): Promise<void> => {
            let su: IStatusUpdate;
            if (this.products === undefined)
                throw new Error(`Error in doExportFile; this.products is undefined`);

            const totalTime: number = 5000;
            const progressStep: number = 10; // Progress increases by 10%
            const intervalTime: number = Math.round((totalTime * progressStep) / 100); // Time per progress step
            let elapsedTime: number = 0;
            let progress: number = 0;
            const totalFileSize: number = randomInt(1_000_000_000, 10_000_000_000);

            // Initialize the download task
            let exportTask: ITask = {
                key: generateGUID(),
                type: ETaskType.Export,
                label: getTaskTypeDescription(ETaskType.Export),
                info: getText('task_type_waiting_desc'),
                description: getText('formatted_percent', (0).toString()),
                time: getText('formatted_time_ms', (0).toLocaleString()),
                state: ETaskState.Started
            };
            this.addOrUpdateTask(exportTask);

            if (this.tasks === undefined)
                throw new Error(`Error in downloadURLFaker; this.tasks is undefined`);

            let updatedTasks: ITask[] = updateOrAddItemWithKey(
                this.tasks,
                {
                    key: exportTask.key,
                    type: exportTask.type,
                    label: exportTask.label,
                    info: exportTask.info,
                    description: exportTask.description,
                    time: exportTask.time,
                    state: exportTask.state
                } as Partial<ITask>,
                'key'
            );
            await delay(200);

            // Dispatch the initial status bar event
            su = {
                type: getFileFormatDescription(currentFileFormat),
                fileSize: formatFileSize(this.getCurrentFileOrFail().size),
                dataMetrics: generateRandomDataMetrics(currentFileFormat, 0), // TODO: After implementing file size retrieval (e.g., from headers), replace this 0
                taskSummary: {
                    progressSummary: 0,
                    cancelable: isTaskCancelable(ETaskType.Export),
                    info: getTaskTypeDescription(ETaskType.Export),
                    description: (this.tasks.length > 1) ? exportTask.info + ` (${this.tasks.length}/${this.tasks.length})` : exportTask.info
                },
                tasks: updatedTasks
            };
            this.dispatchEvent(new CustomEvent<IStatusUpdate>('updateStatus', {detail: su}));

            // Increment progress every interval
            let currentTask: ITask | undefined;
            const interval: number = setInterval(() => {
                currentTask = this.tasks.find((t: ITask): boolean => (t.key === exportTask.key));
                if (currentTask === undefined || currentTask.state === ETaskState.Canceled) {
                    exportTask = {
                        ...exportTask,
                        label: getTaskTypeLabel(ETaskType.Export) + ' (canceled)',
                        info: formatFileSize((totalFileSize * (progress / 100))),
                        description: getText('formatted_percent', (progress).toString()),
                        time: getText('formatted_time_ms', (elapsedTime).toLocaleString()),
                        state: ETaskState.Canceled
                    };
                    clearInterval(interval);
                } else {
                    progress += progressStep;
                    elapsedTime += intervalTime;

                    // Update the task with new progress and elapsed time
                    exportTask = {
                        ...exportTask,
                        label: (progress < 100) ? getTaskTypeDescription(ETaskType.Export) : getTaskTypeLabel(ETaskType.Export),
                        info: formatFileSize((totalFileSize * (progress / 100))),
                        description: getText('formatted_percent', (progress).toString()),
                        time: getText('formatted_time_ms', (elapsedTime).toLocaleString()),
                        ...((exportTask.state === ETaskState.InProgress && progress < 100) ? {} : {state: progress < 100 ? ETaskState.InProgress : ETaskState.Finished})
                    };
                }

                this.addOrUpdateTask(exportTask);
                updatedTasks = updateOrAddItemWithKey(
                    this.tasks,
                    {
                        key: exportTask.key,
                        label: exportTask.label,
                        info: exportTask.info,
                        description: exportTask.description,
                        time: exportTask.time,
                        ...((exportTask.state === ETaskState.InProgress && progress < 100) ? {} : {state: progress < 100 ? ETaskState.InProgress : ETaskState.Finished})
                    } as Partial<ITask>,
                    'key'
                );

                // Dispatch the updated status bar event
                if (currentTask === undefined || currentTask.state === ETaskState.Canceled) {
                    su = {
                        tasks: updatedTasks,
                        taskSummary: {
                            info: getText('formatted_info_rows_scanned', (Math.round((progress / 100) * this.getCurrentViewOrFail().rowCount)).toLocaleString()),
                            description: (this.tasks.length > 1) ? exportTask.info + ` (${this.tasks.length}/${this.tasks.length})` : exportTask.info,
                            progressSummary: 100
                        }
                    };
                } else {
                    const p: string = getText('formatted_description_size', formatFileSize(totalFileSize * (progress / 100) / (elapsedTime / 1000)));
                    if (progress === 100) {
                        su = {
                            tasks: updatedTasks,
                            taskSummary: {
                                info: getText('formatted_info_rows_scanned', (Math.round((progress / 100) * this.getCurrentViewOrFail().rowCount)).toLocaleString()),
                                description: p
                            }
                        };
                    } else {
                        su = {
                            tasks: updatedTasks,
                            taskSummary: {
                                progressSummary: progress,
                                description: (this.tasks.length > 1) ? p + ` (${this.tasks.length}/${this.tasks.length})` : p
                            }
                        };
                    }
                }

                this.dispatchEvent(new CustomEvent<IStatusUpdate>('updateStatus', {detail: su}));

                // Clear the interval and complete the task when progress reaches 100%
                if (progress >= 100)
                    clearInterval(interval);

            }, intervalTime);

            // Wait until the task completes
            await new Promise(resolve => {
                const checkCompletion: number = setInterval(() => {
                    if (progress >= 100) {
                        clearInterval(checkCompletion);
                        resolve(undefined);
                    }
                }, 100);
            });

        }, 'doExportFile', ...arguments);
    }

    private generateAndAddProducts(rowCount: number) {
        errorCatch((rowCount: number) => {
            if (this.products === undefined)
                throw new Error(`Error in generateAndAddProducts; this.products is undefined`);
            populateProductCSVData(rowCount, this.products);
        }, 'generateAndAddProducts', ...arguments);
    }

    private getProductContent(rowIndex: number, columnIndex: number): string {
        return errorCatch((rowIndex: number, columnIndex: number): string => {
            //Todo: remove this check, should be handled from UI side
            if ((this.products === undefined) || !Array.isArray(this.products) || (this.products.length === 0) || (rowIndex >= this.products.length))
                return '';
            return this.products[rowIndex][columnIndex];
        }, 'getProductContent', ...arguments);
    }

    private getProductRangeContent(ranges: TRange[]): string {
        return errorCatch((ranges: TRange[]): string => {
            if (this.products === undefined)
                throw new Error(`Error in getProductRangeContent; this.products is undefined`);
            let content = '';
            for (const [startRow, startCol, endRow, endCol] of ranges) {
                for (let row = startRow; row <= endRow; row++) {
                    let rowContent: string[] = [];
                    for (let col = startCol; col <= endCol; col++)
                        rowContent.push(String(this.products[row][col]));
                    content += rowContent.join(', ') + '\n';
                }
            }
            return content.trim();
        }, 'getProductRangeContent', ranges);
    }

    private requiredLevelForCurrentFileSize(fileSize: number): number {
        return errorCatch((fileSize: number): number => {
            let levelBelow: number = -1;
            for (let i: number = 0; i < SIZE_LIMITS.length; i++)
                if (fileSize > SIZE_LIMITS[i])
                    levelBelow = i;
                else
                    break;

            return levelBelow;
        }, 'requiredLevelForCurrentFileSize', ...arguments);
    }

    //Todo: use this whenever wanna sync settings
    private updateSettings(save: boolean = true, updateSettings: boolean = true) {
        errorCatch((save: boolean = true, updateSettings: boolean = true) => {
            if (save)
                saveToLocalStorage('settings', this.settings);
            if (updateSettings)
                this.dispatchEvent(new CustomEvent<ISettings>('updateSettings', {detail: this.settings}));
            this.dispatchEvent(new CustomEvent<ISettings>('updateSettingsSync', {detail: this.settings}));
        }, 'updateSettings', ...arguments);
    }

    // setting
    private updateLicenseInfo(license: ILicense, file: IFile | undefined = undefined) {
        errorCatch((license: ILicense, file: IFile | undefined = undefined) => {
            license.title = license.level === 0 ? getText('app_default_license_name') : getLicenseName(license.level);
            const f: IFile | undefined = file ?? this.getCurrentFileOrFail();
            if (f) {
                const fileSize: number = f.size;
                const targetLevel: number = this.requiredLevelForCurrentFileSize(fileSize);
                f.bannerText = (targetLevel > license.level) ? getLicenseBannerText(targetLevel) : undefined;
                saveToLocalStorage('files', this.files);

                //Update view and update content to let UI know about
                if (this.currentView && this.currentFileOriginalInfo) {
                    const vu: IViewUpdate = {viewKey: this.currentView.key, viewMode: this.currentView.viewMode};
                    this.dispatchEvent(new CustomEvent<IViewUpdate>('updateView', {detail: vu}));
                    this.dispatchEvent(new CustomEvent<IViewUpdate>('updateViewSync', {detail: vu}));

                    // Update content
                    const cu: IContentUpdate = {
                        viewKey: f.currentViewKey,
                        range: [0, 0, this.currentFileOriginalInfo!.rowCount - 1, this.currentFileOriginalInfo!.columns.length - 1]
                    };
                    this.dispatchEvent(new CustomEvent<IContentUpdate>('updateContent', {detail: cu}));
                }

            }
            this.settings.accountAndLicense.license = license;
            this.updateSettings();
        }, 'updateLicenseInfo', ...arguments);
    }

    //Query
    private async doExecuteQuerySimulation(view: IView | undefined = undefined): Promise<void> {
        return await errorCatchAsync(async (view: IView | undefined = undefined): Promise<void> => {
            const v: IView = view ?? this.getCurrentViewOrFail();
            let su: IStatusUpdate, vu: IViewUpdate, cu: IContentUpdate, e: IEditor;

            //For testing purposes if the code starts with 'error' then we say it has syntax error
            const errorDetail = !v.editor.code?.trim() ? {
                message: getText('sql_editor_empty_code'),
                moreInfo: ''
            } : (v.editor.code.trim().toLowerCase().startsWith('error') ? {
                message: getText('sql_editor_syntax_error'),
                moreInfo: getText('sql_editor_syntax_error_more_info')
            } : null);

            if (errorDetail) {
                v.editor = {
                    ...v.editor,
                    error: errorDetail.message,
                    moreInfo: errorDetail.moreInfo,
                    state: EEditorState.SyntaxError
                };
                e = {
                    error: v.editor.error,
                    moreInfo: v.editor.moreInfo,
                    state: v.editor.state
                };
                this.dispatchUpdateViewEditor(e);
                this.updateViewForEditor(e);
                return;
            } else {
                v.editor.error = undefined;
                v.editor.moreInfo = undefined;
                v.editor.state = EEditorState.InProgress;
            }
            saveToLocalStorage('files', this.files);

            e = {state: EEditorState.InProgress};
            vu = {viewKey: v.key, editor: e};
            this.dispatchEvent(new CustomEvent<IViewUpdate>('updateView', {detail: vu}));
            this.dispatchEvent(new CustomEvent<IViewUpdate>('updateViewSync', {detail: vu}));

            if (this.products === undefined)
                throw new Error(`Error in doExecuteQuerySimulation; this.products is undefined`);

            // Store current products so we can revert if terminated
            this.previousProductsSnapshot = this.products.map(r => [...r]);

            //Some initializations
            const totalRowsToFetch: number = 200;
            const stepCount: number = 4;
            const rowsPerStep: number = totalRowsToFetch / stepCount;
            const delayPerStep: number = 100; // ms per step

            // Step 1: Create a query task and update status bar after 100 ms
            const queryTaskKey: string = generateGUID();
            let queryTask: ITask = {
                key: queryTaskKey,
                type: ETaskType.Query,
                label: getTaskTypeDescription(ETaskType.Query),
                info: getText('task_type_waiting_desc'),
                description: getText('formatted_percent', (0).toString()),
                time: getText('formatted_time_ms', (0).toLocaleString()),
                state: ETaskState.Started
            };
            this.addOrUpdateTask(queryTask);
            this.currentQueryTaskKey = queryTaskKey;
            await delay(100);

            if (this.tasks === undefined)
                throw new Error(`Error in doExecuteQuerySimulation; this.tasks is undefined`);

            let updatedTasks: ITask[] = updateOrAddItemWithKey(
                this.tasks,
                {
                    key: queryTask.key,
                    type: queryTask.type,
                    label: queryTask.label,
                    info: queryTask.info,
                    description: queryTask.description,
                    time: queryTask.time,
                    state: queryTask.state
                } as Partial<ITask>,
                'key'
            );

            su = {
                type: getFileFormatDescription(currentFileFormat),
                fileSize: formatFileSize(this.getCurrentFileOrFail().size),
                dataMetrics: generateRandomDataMetrics(currentFileFormat, this.getCurrentFileOrFail().size),
                taskSummary: <ITaskSummary>{
                    progressSummary: 0,
                    cancelable: isTaskCancelable(ETaskType.Query),
                    info: getTaskTypeDescription(ETaskType.Query),
                    description: (this.tasks.length > 1) ? queryTask.info + ` (${this.tasks.length}/${this.tasks.length})` : queryTask.info
                },
                tasks: updatedTasks
            };
            this.dispatchEvent(new CustomEvent<IStatusUpdate>('updateStatus', {detail: su}));
            await delay(200);

            // Step 2: Initial status update after a small delay. Simulate query execution steps, similar to openFileSimulation, generate rows in increments and update progress
            queryTask.description = getText('formatted_percent', (0).toString());
            queryTask.state = ETaskState.InProgress;

            updatedTasks = updateOrAddItemWithKey(
                this.tasks,
                {
                    key: queryTask.key,
                    info: queryTask.info,
                    description: queryTask.info,
                    state: queryTask.state
                } as Partial<ITask>,
                'key'
            );
            this.addOrUpdateTask(queryTask);

            su = {
                taskSummary: {
                    progressSummary: 0,
                    cancelable: isTaskCancelable(ETaskType.Query),
                    info: getTaskTypeDescription(ETaskType.Query),
                    description: (this.tasks.length > 1) ? queryTask.info + ` (${this.tasks.length}/${this.tasks.length})` : queryTask.info
                },
                tasks: updatedTasks
            };
            this.dispatchEvent(new CustomEvent<IStatusUpdate>('updateStatus', {detail: su}));

            let fetchedRows: number = 0;
            const startTime: number = performance.now();
            let currentTask: ITask | undefined;
            for (let i: number = 1; i <= stepCount; i++) {
                currentTask = this.tasks.find((t: ITask): boolean => (t.key === queryTaskKey));
                await delay(delayPerStep + 1000);
                // Check if Query was canceled mid-execution
                if (currentTask === undefined || currentTask.state === ETaskState.Canceled) {
                    vu = {viewKey: v.key, editor: <IEditor>{state: EEditorState.Idle}};
                    v.editor = {...v.editor, state: EEditorState.Idle};
                    saveToLocalStorage('files', this.files);
                    this.dispatchEvent(new CustomEvent<IViewUpdate>('updateView', {detail: vu}));
                    this.dispatchEvent(new CustomEvent<IViewUpdate>('updateViewSync', {detail: vu}));
                    break;
                } else {
                    // Replace current products with query result incrementally
                    populateProductCSVData(rowsPerStep, this.products);
                    fetchedRows += rowsPerStep;
                    const progress: number = Math.round((fetchedRows / totalRowsToFetch) * 100);

                    // Update the task and status by it
                    queryTask = {
                        ...queryTask,
                        info: getText('formatted_query_info', (fetchedRows).toLocaleString()),
                        description: getText('formatted_percent', (progress).toString()),
                        time: getText('formatted_time_ms', ((Math.floor(performance.now() - startTime))).toLocaleString()),
                        ...(queryTask.state === ETaskState.InProgress && progress < 100
                            ? {}
                            : {
                                state: progress < 100 ? ETaskState.InProgress : ETaskState.Finished
                            })
                    };
                    this.addOrUpdateTask(queryTask);

                    updatedTasks = updateOrAddItemWithKey(
                        this.tasks,
                        {
                            key: queryTask.key,
                            info: queryTask.info,
                            description: queryTask.description,
                            time: queryTask.time,
                            state: queryTask.state
                        } as Partial<ITask>,
                        'key'
                    );

                    su = {
                        info: `${(v.columns.length).toLocaleString()} x ${(fetchedRows).toLocaleString()}`,
                        taskSummary: {
                            progressSummary: progress,
                            info: getTaskTypeDescription(ETaskType.Query),
                            description: (this.tasks.length > 1) ? queryTask.info + ` (${this.tasks.length}/${this.tasks.length})` : queryTask.info
                        },
                        tasks: updatedTasks
                    };
                    this.dispatchEvent(new CustomEvent<IStatusUpdate>('updateStatus', {detail: su}));

                    if (progress === 100) {
                        vu = {
                            viewKey: v.key,
                            editor: <IEditor>{
                                state: EEditorState.Idle
                            }
                        };
                        v.editor = {...v.editor, state: EEditorState.Idle};
                        saveToLocalStorage('files', this.files);
                        this.dispatchEvent(new CustomEvent<IViewUpdate>('updateView', {detail: vu}));
                        this.dispatchEvent(new CustomEvent<IViewUpdate>('updateViewSync', {detail: vu}));
                    }

                    // Dispatch content update
                    v.rowCount = fetchedRows;
                    saveToLocalStorage('files', this.files);
                    cu = {
                        viewKey: v.key,
                        range: [fetchedRows - rowsPerStep, 0, fetchedRows - 1, v.columns.length - 1]
                    };
                    this.dispatchEvent(new CustomEvent<IContentUpdate>('updateContent', {detail: cu}));

                    // Dispatch view update
                    vu = {viewKey: v.key, rowCount: fetchedRows};
                    this.dispatchEvent(new CustomEvent<IViewUpdate>('updateView', {detail: vu}));
                    this.dispatchEvent(new CustomEvent<IViewUpdate>('updateViewSync', {detail: vu}));
                }
            } //Finished progress steps

            //Finished or canceled, dispatch final status update
            const ts: ETaskState = (currentTask && currentTask.state === ETaskState.Canceled) ? ETaskState.Canceled : ETaskState.Finished;
            const totalTime: string = getText('formatted_time_ms', ((Math.floor(performance.now() - startTime))).toLocaleString());
            queryTask = {
                ...queryTask,
                label: (currentTask && currentTask.state === ETaskState.Canceled) ? getTaskTypeLabel(ETaskType.Query) + ' (canceled)' : getTaskTypeLabel(ETaskType.Query),
                info: getText('formatted_query_info', (fetchedRows).toLocaleString()),
                description: getText('formatted_description_rows_no_parenthesis', (calculateOverallPerformance([{
                    progress: 100,
                    rowsToGenerate: sampleFileRowCount,
                    timeTaken: (Math.floor(performance.now() - startTime))
                }])).toLocaleString()),
                time: totalTime,
                state: ts
            };

            updatedTasks = updateOrAddItemWithKey(
                this.tasks,
                {
                    key: queryTask.key,
                    label: queryTask.label,
                    info: queryTask.info,
                    description: queryTask.description,
                    time: queryTask.time,
                    state: queryTask.state
                } as Partial<ITask>,
                'key'
            );

            this.addOrUpdateTask(queryTask);
            su = {
                info: `${(v.columns.length).toLocaleString()} x ${(fetchedRows).toLocaleString()}`,
                taskSummary: {
                    info: getText('formatted_query_info', (fetchedRows).toLocaleString()),
                    description: getText('formatted_description_rows', (calculateOverallPerformance([{
                        progress: 100,
                        rowsToGenerate: sampleFileRowCount,
                        timeTaken: (Math.floor(performance.now() - startTime))
                    }])).toLocaleString())
                },
                tasks: updatedTasks
            };
            this.dispatchEvent(new CustomEvent<IStatusUpdate>('updateStatus', {detail: su}));

            this.currentQueryTaskKey = undefined;
            this.previousProductsSnapshot = undefined;
        }, 'doExecuteQuerySimulation', ...arguments);
    }

    private doTerminateQuery() {
        errorCatch(() => {
            // No query is running
            if (this.currentQueryTaskKey === undefined)
                throw new Error(`Error in doTerminateQuery; this.currentQueryTaskKey is undefined`);

            if (this.tasks === undefined)
                throw new Error(`Error in doTerminateQuery; this.tasks is undefined`);

            const queryTaskKey: string = this.currentQueryTaskKey;
            const queryTaskIndex: number = this.tasks.findIndex(t => t.key === queryTaskKey && t.type === ETaskType.Query);

            // Mark the task as canceled
            const queryTask = this.tasks[queryTaskIndex];
            if (queryTask.state === ETaskState.InProgress || queryTask.state === ETaskState.Started) {
                this.doCancelTask(queryTask);

                // Revert products to previous state if available
                if (this.previousProductsSnapshot)
                    this.products = this.previousProductsSnapshot.map(r => [...r]);

                // restore rowCount if changed
                const view: IView = this.getCurrentViewOrFail();

                if (this.products === undefined)
                    throw new Error(`Error in doExecuteQuerySimulation; this.products is undefined`);

                view.rowCount = this.products.length;
                saveToLocalStorage('files', this.files);

                // Dispatch view update
                const vu: IViewUpdate = {viewKey: view.key, rowCount: view.rowCount};
                this.dispatchEvent(new CustomEvent<IViewUpdate>('updateView', {detail: vu}));
                this.dispatchEvent(new CustomEvent<IViewUpdate>('updateViewSync', {detail: vu}));
            }

            // Clean up
            this.currentQueryTaskKey = undefined;
            this.previousProductsSnapshot = undefined;
        }, 'doTerminateQuery', ...arguments);
    }

    //Refiner
    // Simulates the filtering process by progressively refining rows.
    private async doFilterSimulation(refinerKey: string): Promise<void> {
        return await errorCatchAsync(async (refinerKey: string): Promise<void> => {
            await delay(500); //TODO: For testing purposes, remove after test
            let su: IStatusUpdate;
            const view: IView = this.getCurrentViewOrFail();
            const refiner: IRefiner | undefined = view.refiners.find((r) => r.key === refinerKey);
            if (refiner === undefined)
                throw new Error(`Error in doFilterSimulation; no refiner for key: ${refinerKey}`);

            if (refiner && refiner.columns && refiner.content) {

                // Initial status update
                let filterTask: ITask = {
                    key: generateGUID(),
                    type: ETaskType.Filter,
                    label: getTaskTypeDescription(ETaskType.Filter),
                    info: getText('task_type_waiting_desc'),
                    description: getText('formatted_percent', (0).toString()),
                    time: getText('formatted_time_ms', (0).toLocaleString()),
                    state: ETaskState.Started
                };
                this.addOrUpdateTask(filterTask);

                if (this.tasks === undefined)
                    throw new Error(`Error in doFilterSimulation; this.tasks is undefined`);

                let updatedTasks: ITask[] = updateOrAddItemWithKey(
                    this.tasks,
                    {
                        key: filterTask.key,
                        type: filterTask.type,
                        label: filterTask.label,
                        info: filterTask.info,
                        description: filterTask.description,
                        time: filterTask.time,
                        state: filterTask.state
                    } as Partial<ITask>,
                    'key'
                );

                su = {
                    taskSummary: <ITaskSummary>{
                        progressSummary: 0,
                        cancelable: isTaskCancelable(ETaskType.Filter),
                        info: getTaskTypeDescription(ETaskType.Filter),
                        description: (this.tasks.length > 1) ? filterTask.info + ` (${this.tasks.length}/${this.tasks.length})` : filterTask.info
                    },
                    tasks: updatedTasks
                };
                this.dispatchEvent(new CustomEvent<IStatusUpdate>('updateStatus', {detail: su}));

                if (this.products === undefined)
                    throw new Error(`Error in doFilterSimulation; this.products is undefined`);

                // Make a copy of the original products array
                const originalProducts = [...this.products];
                const totalSteps: number = 4;
                const originalRowCount: number = originalProducts.length;

                // TODO: remove later, this is for testing purposes
                // if (refiner.content === 'filter')
                //     originalRowCount = 10;
                const chunkSize: number = Math.floor(originalRowCount * 0.25); // 25% of original products per step
                const results: string[][] = []; // Array to store the final filtered rows
                const progressSteps: IProgressStep[] = generateDynamicProgressSteps(originalRowCount, totalSteps);// Generate dynamic progress steps

                //Progress steps for filter
                const startTime: number = performance.now();
                let currentTask: ITask | undefined;
                for (let stepIndex: number = 0; stepIndex < progressSteps.length; stepIndex++) {
                    currentTask = this.tasks.find((t: ITask): boolean => (t.key === filterTask.key));
                    const step: IProgressStep = progressSteps[stepIndex];
                    await delay(step.timeTaken + 1000);

                    // Check if task was canceled mid-execution
                    if (currentTask === undefined || currentTask.state === ETaskState.Canceled)
                        break;
                    else {
                        // Calculate rows for the current chunk
                        const start: number = stepIndex * chunkSize;
                        const end: number = Math.min((stepIndex + 1) * chunkSize, originalRowCount);
                        const chunkRows: string[][] = originalProducts.slice(start, end);

                        // Retain 5% of rows from this chunk
                        const rowsToRetain: number = Math.floor(chunkRows.length * 0.05);
                        const retainedRows: string[][] = chunkRows.slice(0, rowsToRetain);
                        results.push(...retainedRows);

                        // Update task progress
                        filterTask = {
                            ...filterTask,
                            info: getText('formatted_info_rows_scanned', (retainedRows.length).toLocaleString()),
                            description: getText('formatted_percent', (step.progress).toString()),
                            time: getText('formatted_time_ms', ((Math.floor(performance.now() - startTime))).toLocaleString()),
                            ...(filterTask.state === ETaskState.InProgress && step.progress < 100
                                ? {}
                                : {
                                    state: step.progress < 100 ? ETaskState.InProgress : ETaskState.Finished
                                })
                        };
                        this.addOrUpdateTask(filterTask);

                        if (this.tasks === undefined)
                            throw new Error(`Error in doFilterSimulation; this.tasks is undefined`);

                        updatedTasks = updateOrAddItemWithKey(
                            this.tasks,
                            {
                                key: filterTask.key,
                                info: filterTask.info,
                                description: filterTask.description,
                                time: filterTask.time,
                                state: filterTask.state
                            } as Partial<ITask>,
                            'key'
                        );

                        su = {
                            info: `${(view.columns.length).toLocaleString()} x ${(results.length).toLocaleString()}`,
                            taskSummary: <ITaskSummary>{
                                progressSummary: step.progress,
                                description: (this.tasks.length > 1) ? filterTask.info + ` (${this.tasks.length}/${this.tasks.length})` : filterTask.info
                            },
                            tasks: updatedTasks
                        };
                        this.dispatchEvent(new CustomEvent<IStatusUpdate>('updateStatus', {detail: su}));

                        // Update view row count
                        view.rowCount = results.length;
                        const vu: IViewUpdate = {viewKey: view.key, rowCount: results.length};
                        this.dispatchEvent(new CustomEvent<IViewUpdate>('updateView', {detail: vu}));
                        this.dispatchEvent(new CustomEvent<IViewUpdate>('updateViewSync', {detail: vu}));

                        // Dispatch content update
                        const cu: IContentUpdate = {
                            viewKey: view.key,
                            range: [Math.max(0, start), 0, Math.min(results.length - 1, results.length + retainedRows.length - 1), view.columns.length - 1]
                        };
                        this.dispatchEvent(new CustomEvent<IContentUpdate>('updateContent', {detail: cu}));
                    }
                }//Progress steps finished

                // Finalize task; Update status for finish step
                const ts: ETaskState = (currentTask && currentTask.state === ETaskState.Canceled) ? ETaskState.Canceled : ETaskState.Finished;
                const totalTime: string = getText('formatted_time_ms', ((Math.floor(performance.now() - startTime))).toLocaleString());

                filterTask = {
                    ...filterTask,
                    label: (currentTask && currentTask.state === ETaskState.Canceled) ? getTaskTypeLabel(ETaskType.Filter) + ' (canceled)' : getTaskTypeLabel(ETaskType.Filter),
                    info: getText('formatted_info_rows_scanned', (results.length).toLocaleString()),
                    description: getText('formatted_description_rows_no_parenthesis', (calculateOverallPerformance(progressSteps)).toLocaleString()),
                    time: totalTime,
                    state: ts
                };
                this.addOrUpdateTask(filterTask);

                if (this.tasks === undefined)
                    throw new Error(`Error in doFilterSimulation; this.tasks is undefined`);

                updatedTasks = updateOrAddItemWithKey(
                    this.tasks,
                    {
                        key: filterTask.key,
                        label: filterTask.label,
                        info: filterTask.info,
                        description: filterTask.description,
                        time: filterTask.time,
                        state: filterTask.state
                    } as Partial<ITask>,
                    'key'
                );

                su = {
                    info: `${(view.columns.length).toLocaleString()} x ${(results.length).toLocaleString()}`,
                    taskSummary: <ITaskSummary>{
                        info: getText('formatted_info_rows_scanned', (results.length).toLocaleString()),
                        description: getText('formatted_description_rows', (calculateOverallPerformance(progressSteps)).toLocaleString())
                    },
                    tasks: updatedTasks
                };
                this.dispatchEvent(new CustomEvent<IStatusUpdate>('updateStatus', {detail: su}));
                saveToLocalStorage('files', this.files);
            }
        }, 'doFilterSimulation', ...arguments);
    }

    private resetRefinerResults(refinerKey: string, view: IView | undefined = undefined) {
        errorCatch((refinerKey: string, view: IView | undefined = undefined) => {
            const refiner: IRefiner | undefined = this.getRefinerByKeyOrFail(refinerKey, view);
            refiner.resultCount = 0;
            refiner.currentFind = undefined;
            delete this.findResults[refinerKey];

            const pr: Partial<IRefiner> = {
                resultCount: refiner.resultCount,
                currentFind: refiner.currentFind
            };
            const vu: IViewUpdate = this.getUpdateViewWithRefiner(refiner.key, pr);
            this.dispatchEvent(new CustomEvent<IViewUpdate>('updateView', {detail: vu}));
            this.dispatchEvent(new CustomEvent<IViewUpdate>('updateViewSync', {detail: vu}));

            this.updateViewSyncWithRefiner(refiner.key, {
                resultCount: refiner.resultCount,
                currentFind: refiner.currentFind
            });
            saveToLocalStorage('files', this.files);
        }, 'resetRefinerResults', ...arguments);
    }

    private async doRefiner(refinerKey: string, refinerType: ERefinerType, resetResults: boolean = true, view: IView | undefined = undefined): Promise<void> {
        return await errorCatchAsync(async (refinerKey: string, refinerType: ERefinerType, resetResults: boolean = true, view: IView | undefined = undefined): Promise<void> => {
            if (resetResults)
                this.resetRefinerResults(refinerKey, view);
            if (refinerType === ERefinerType.Find)
                return await this.doFindSimulation(refinerKey);
            else if (refinerType === ERefinerType.Filter)
                return await this.doFilterSimulation(refinerKey);
        }, 'doRefiner', ...arguments);
    }

    //Do all the view's refiner jobs based on the filter mode
    private async doViewRefiners(view: IView, resetResults: boolean = true): Promise<void> {
        return await errorCatchAsync(async (view: IView, resetResults: boolean = true): Promise<void> => {
            if (view.filterMode === EFilterMode.Refiner) {
                if (view.refiners.length > 0)
                    for (const r of view.refiners)
                        if (r.type !== undefined)
                            await this.doRefiner(r.key, r.type, resetResults, view);
            } else if ((view.filterMode === EFilterMode.SQL) && (view.editor)) {
                if ((view.editor.refiner) && (view.editor.refiner.type !== undefined))
                    await this.doRefiner(view.editor.refiner?.key, view.editor.refiner?.type, resetResults);
                if ((view.editor.code) && (view.editor.code !== ''))
                    await this.doExecuteQuerySimulation(view);
            }
        }, 'doViewRefiners', ...arguments);
    }


    private getUpdateViewWithRefiner(refinerKey: string, updatedFields: Partial<IRefiner>): IViewUpdate {
        return errorCatch((refinerKey: string, updatedFields: Partial<IRefiner>): IViewUpdate => {
            const view: IView = this.getCurrentViewOrFail();
            const vu: IViewUpdate = {viewKey: view.key}
            if (view.editor && view.editor.refiner?.key === refinerKey)
                vu.editor = {refiner: view.editor.refiner}
            else {
                vu.refiners = updateOrAddItemWithKey(
                    view.refiners,
                    {key: refinerKey, ...updatedFields} as Partial<IRefiner>,
                    'key'
                )
            }
            return vu;
        }, 'getUpdateViewWithRefiner', ...arguments);
    }

    private updateViewSyncWithRefiner(refinerKey: string, updatedFields: Partial<IRefiner>) {
        errorCatch((refinerKey: string, updatedFields: Partial<IRefiner>) => {
            const vu: IViewUpdate = this.getUpdateViewWithRefiner(refinerKey, updatedFields);
            this.dispatchEvent(new CustomEvent<IViewUpdate>('updateViewSync', {detail: vu}));
        }, 'updateViewSyncWithRefiner', ...arguments);
    }

    // Simulates and populates find results for a specific refiner.
    private async doFindSimulation(refinerKey: string): Promise<void> {
        return await errorCatchAsync(async (refinerKey: string): Promise<void> => {
            await delay(100); //TODO: For testing purposes, remove after test
            const view: IView = this.getCurrentViewOrFail();
            const refiner: IRefiner | undefined = this.getRefinerByKeyOrFail(refinerKey, view);
            let su: IStatusUpdate;

            if (refiner && refiner.columns && refiner.content) {
                //If refiner has no columns, fallback to all the file's original columns
                const colCount: number = refiner.columns.length > 0 ? refiner.columns.length : (this.currentFileOriginalInfo ? this.currentFileOriginalInfo.columns.length : 0);
                const rowCount: number = view.rowCount;
                const totalFindCount: number = getRandomNumberInRange(1, rowCount); // Total finds randomly generated

                // Generate progress steps for simulation
                const progressSteps: IProgressStep[] = generateDynamicProgressSteps(totalFindCount, 3);
                let cumulativeFindCount: number = 0;

                // Task initialization
                let findTask: ITask = {
                    key: generateGUID(),
                    type: ETaskType.Find,
                    label: getTaskTypeDescription(ETaskType.Find),
                    info: getText('task_type_waiting_desc'),
                    description: getText('formatted_percent', (0).toString()),
                    time: getText('formatted_time_ms', (0).toLocaleString()),
                    state: ETaskState.Started
                };
                this.addOrUpdateTask(findTask);

                if (this.tasks === undefined)
                    throw new Error(`Error in doFindSimulation; this.tasks is undefined`);

                let updatedTasks: ITask[] = updateOrAddItemWithKey(
                    this.tasks,
                    {
                        key: findTask.key,
                        type: findTask.type,
                        label: findTask.label,
                        info: findTask.info,
                        description: findTask.description,
                        time: findTask.time,
                        state: findTask.state
                    } as Partial<ITask>,
                    'key'
                );

                su = {
                    taskSummary: <ITaskSummary>{
                        progressSummary: 0,
                        cancelable: isTaskCancelable(ETaskType.Find),
                        info: getTaskTypeDescription(ETaskType.Find),
                        description: (this.tasks.length > 1) ? findTask.info + ` (${this.tasks.length}/${this.tasks.length})` : findTask.info
                    },
                    tasks: updatedTasks
                };
                this.dispatchEvent(new CustomEvent<IStatusUpdate>('updateStatus', {detail: su}));

                //Progress steps for find
                const startTime: number = performance.now();
                let currentTask: ITask | undefined;
                let stepIndex: number = 0;
                for (stepIndex = 0; stepIndex < progressSteps.length; stepIndex++) {
                    currentTask = this.tasks.find((t: ITask): boolean => (t.key === findTask.key));
                    const step: IProgressStep = progressSteps[stepIndex];
                    await delay(step.timeTaken + 1000);

                    // Check if task was canceled mid-execution
                    if (currentTask === undefined || currentTask.state === ETaskState.Canceled)
                        break;
                    else {
                        const findsForThisStep: number = step.rowsToGenerate;

                        // //TODO: remove after test, this is just for testing UI highlight performance
                        // if (refiner.content === 'find')
                        //     cumulativeFindCount += this.generateFakeFullFinds(refinerKey, rowCount, colCount, findsForThisStep);
                        // else

                        cumulativeFindCount += this.generateFakeFinds(refiner, rowCount, colCount, findsForThisStep);

                        // Update task progress
                        findTask = {
                            ...findTask,
                            info: getText('formatted_info_rows_scanned', (step.rowsToGenerate).toLocaleString()),
                            description: getText('formatted_percent', (step.progress).toString()),
                            time: getText('formatted_time_ms', (progressSteps.reduce((sum: number, s: IProgressStep): number =>
                                sum + s.timeTaken, 0)).toLocaleString()),
                            ...(findTask.state === ETaskState.InProgress && step.progress < 100
                                ? {}
                                : {
                                    state: step.progress < 100 ? ETaskState.InProgress : ETaskState.Finished
                                })
                        };
                        this.addOrUpdateTask(findTask);

                        if (this.tasks === undefined)
                            throw new Error(`Error in doFindSimulation; this.tasks is undefined`);

                        updatedTasks = updateOrAddItemWithKey(
                            this.tasks,
                            {
                                key: findTask.key,
                                info: findTask.info,
                                description: findTask.description,
                                time: findTask.time,
                                state: findTask.state
                            } as Partial<ITask>,
                            'key'
                        );

                        su = {
                            info: `${(view.columns.length).toLocaleString()} x ${(cumulativeFindCount).toLocaleString()}`,
                            taskSummary: <ITaskSummary>{
                                progressSummary: step.progress,
                                description: (this.tasks.length > 1) ? findTask.info + ` (${this.tasks.length}/${this.tasks.length})` : findTask.info
                            },
                            tasks: updatedTasks
                        };
                        this.dispatchEvent(new CustomEvent<IStatusUpdate>('updateStatus', {detail: su}));

                        refiner.resultCount = cumulativeFindCount;
                        const vu: IViewUpdate = {viewKey: ''};
                        if (view.editor && view.editor.refiner?.key === refinerKey)
                            vu.editor = {refiner: view.editor.refiner};
                        else
                            vu.refiners = updateOrAddItemWithKey(
                                view.refiners,
                                {key: refiner.key, resultCount: refiner.resultCount} as Partial<IRefiner>,
                                'key'
                            );
                        this.dispatchEvent(new CustomEvent<IViewUpdate>('updateView', {detail: vu}));
                        this.dispatchEvent(new CustomEvent<IViewUpdate>('updateViewSync', {detail: vu}));
                    }
                } //Finished progress steps

                // Finalize task; Update status for finish step
                const ts: ETaskState = (currentTask && currentTask.state === ETaskState.Canceled) ? ETaskState.Canceled : ETaskState.Finished;
                const totalTime: string = getText('formatted_time_ms', ((Math.floor(performance.now() - startTime))).toLocaleString());

                findTask = {
                    ...findTask,
                    label: (currentTask && currentTask.state === ETaskState.Canceled) ? getTaskTypeLabel(ETaskType.Find) + ' (canceled)' : getTaskTypeLabel(ETaskType.Find),
                    info: getText('formatted_info_rows_scanned', (Math.round((stepIndex / progressSteps.length) * rowCount)).toLocaleString()),
                    description: getText('formatted_description_rows_no_parenthesis',
                        (calculateOverallPerformance(progressSteps)).toLocaleString()),
                    time: totalTime,
                    state: ts
                };
                this.addOrUpdateTask(findTask);

                if (this.tasks === undefined)
                    throw new Error(`Error in doFindSimulation; this.tasks is undefined`);

                updatedTasks = updateOrAddItemWithKey(
                    this.tasks,
                    {
                        key: findTask.key,
                        label: findTask.label,
                        info: findTask.info,
                        description: findTask.description,
                        time: findTask.time,
                        state: findTask.state
                    } as Partial<ITask>,
                    'key'
                );

                su = {
                    info: `${(view.columns.length).toLocaleString()} x ${(cumulativeFindCount).toLocaleString()}`,
                    taskSummary: <ITaskSummary>{
                        info: getText('formatted_info_rows_scanned', (Math.round((stepIndex / progressSteps.length) * rowCount)).toLocaleString()),
                        description: getText('formatted_description_rows', (calculateOverallPerformance(progressSteps)).toLocaleString())
                    },
                    tasks: updatedTasks
                };
                this.dispatchEvent(new CustomEvent<IStatusUpdate>('updateStatus', {detail: su}));
                saveToLocalStorage('files', this.files);
            }

            if (this.currentFileOriginalInfo && this.currentFileOriginalInfo.columns && this.currentFileOriginalInfo.rowCount) {
                this.dispatchEvent(new CustomEvent<IContentUpdate>('updateContent', {
                    detail: <IContentUpdate>{
                        viewKey: this.getCurrentView().key,
                        range: [0, 0, this.currentFileOriginalInfo.rowCount, this.currentFileOriginalInfo.columns.length]
                    }
                }));
            }

        }, 'doFindSimulation', ...arguments);
    }

    // Return the total number of finds generated in this call
    private generateFakeFinds(refiner: IRefiner, rowCount: number, columnCount: number, resultCount: number): number {
        return errorCatch((refinerKey: string, rowCount: number, columnCount: number, resultCount: number): number => {
            let findCountGenerated: number = 0;
            let from: number, to: number, rowIndex: number, columnIndex: number;
            let key: string;

            if (this.findResults[refinerKey] === undefined)
                this.findResults[refinerKey] = {};

            const results: TFindResult = this.findResults[refinerKey];
            const usedKeys = new Set<string>();

            if (refiner.highlight === undefined)
                throw new Error(`Error in generateFakeFinds; refiner.highlight is undefined for refinerKey: ${refinerKey}`);
            const color: EHighlightColor = refiner.highlight;

            const totalTries: number = resultCount * 10;
            let attempts: number = 0;

            while (findCountGenerated < resultCount && attempts < totalTries) {
                attempts++;

                // Sometimes reuse an existing key to ensure repetitive entries to check overlaps in highlights
                if (Math.random() < 0.4 && usedKeys.size > 0) {
                    const keys: string[] = Array.from(usedKeys);
                    key = keys[Math.floor(Math.random() * keys.length)];
                } else {
                    rowIndex = getRandomNumberInRange(0, rowCount - 1);
                    columnIndex = getRandomNumberInRange(0, columnCount - 1);
                    key = `${rowIndex}:${columnIndex}`;
                    usedKeys.add(key);
                }

                //Safely generate a random range in 0 to length of the content
                const [r, c] = key.split(':').map((str: string) => parseInt(str));
                const cellContent: string = this.doGetCellContent(r, c);
                from = getRandomNumberInRange(0, cellContent.length - 1);
                to = from + getRandomNumberInRange(1, cellContent.length - from);

                const insertion = {from, to, color};

                if (!results[key]) {
                    results[key] = [insertion];
                    findCountGenerated++;
                } else {
                    const arr: IFindItem[] = results[key];

                    // Check for overlap
                    const hasOverlap: boolean = arr.some((existing: IFindItem) => {
                        return !(to <= existing.from || from >= existing.to);
                    });

                    if (!hasOverlap) {
                        // Insert in correct position to keep it sorted
                        let inserted: boolean = false;
                        for (let i: number = 0; i < arr.length; i++) {
                            if (from < arr[i].from) {
                                arr.splice(i, 0, insertion);
                                inserted = true;
                                break;
                            }
                        }
                        if (!inserted)
                            arr.push(insertion);
                        findCountGenerated++;
                    }
                }
            }

            // Sort outer keys by row then col
            const sortedEntries: [string, IFindItem[]][] = Object.entries(results).sort((a: [string, IFindItem[]], b: [string, IFindItem[]]) => {
                const [ra, ca] = a[0].split(':').map(Number);
                const [rb, cb] = b[0].split(':').map(Number);
                return ra === rb ? ca - cb : ra - rb;
            });

            const sortedResults: TFindResult = {};
            for (const [key, value] of sortedEntries) {
                sortedResults[key] = value;
            }

            this.findResults[refinerKey] = sortedResults;

            return findCountGenerated;
        }, 'generateFakeFinds', ...arguments);
    }

    // private generateFakeFullFinds(refinerKey: string, rowCount: number, columnCount: number, resultCount: number): number {
    //     return errorCatch((refinerKey: string, rowCount: number, columnCount: number, resultCount: number): number => {
    //         const v: IView = this.getCurrentViewOrFail();
    //         const totalRefiners: number = v.refiners.length;
    //         const refinerIndex: number = v.refiners.findIndex(r => r.key === refinerKey);
    //         let findCountGenerated: number = 0;
    //         let color: EHighlightColor;
    //
    //         if (this.findResults[refinerKey] === undefined)
    //             this.findResults[refinerKey] = {};
    //
    //         const results: TFindResult = this.findResults[refinerKey];
    //         const refiner: IRefiner = v.refiners.find(r => r.key === refinerKey)!;
    //         if (refiner.highlight === undefined)
    //             throw new Error(`Error in generateFakeFinds; refiner.highlight is undefined for refinerKey: ${refinerKey}`);
    //         color = refiner.highlight;
    //
    //         for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    //             for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    //                 const key = `${rowIndex}:${columnIndex}`;
    //                 const cellContent: string = this.doGetCellContent(rowIndex, columnIndex);
    //                 const CELL_CONTENT_LENGTH: number = cellContent.length;
    //
    //                 if (CELL_CONTENT_LENGTH === 0)
    //                     continue;
    //
    //                 const baseSegmentSize = Math.floor(CELL_CONTENT_LENGTH / totalRefiners);
    //                 const remainder = CELL_CONTENT_LENGTH % totalRefiners;
    //
    //                 // Distribute remainder across first N refiners
    //                 const extra = refinerIndex < remainder ? 1 : 0;
    //                 const from = refinerIndex * baseSegmentSize + Math.min(refinerIndex, remainder);
    //                 const to = from + baseSegmentSize + extra;
    //
    //                 results[key] = [{from, to, color}];
    //                 findCountGenerated++;
    //             }
    //         }
    //
    //         // Sort outer keys by row then col
    //         const sortedEntries: [string, IFindItem[]][] = Object.entries(results).sort((a: [string, IFindItem[]], b: [string, IFindItem[]]) => {
    //             const [ra, ca] = a[0].split(':').map(Number);
    //             const [rb, cb] = b[0].split(':').map(Number);
    //             return ra === rb ? ca - cb : ra - rb;
    //         });
    //
    //         const sortedResults: TFindResult = {};
    //         for (const [key, value] of sortedEntries) {
    //             sortedResults[key] = value;
    //         }
    //
    //         this.findResults[refinerKey] = sortedResults;
    //
    //         return findCountGenerated;
    //     }, 'generateFakeFullFinds', ...arguments);
    // }

    private doFindStep(globalFindIndex: number, stepValue: number) {
        errorCatch((globalFindIndex: number, stepValue: number) => {
            const refiner: IRefiner = this.getRefinerByKeyOrFail(this.getActiveRefinerKey());
            let currentFind: ICurrentFind;
            if (refiner.currentFind === undefined) {
                const rc: [number, number] = this.findIndexToRowColumnIndex(globalFindIndex);
                currentFind = {
                    rowIndex: rc[0],
                    colIndex: rc[1],
                    currentFindItemIndex: 1,
                    findItems: this.getFindResult(rc[0], rc[1])
                }
            } else
                currentFind = refiner.currentFind;

            let [ri, ci] = this.findIndexToRowColumnIndex(globalFindIndex);
            let curIdx: number | undefined = currentFind.currentFindItemIndex;
            if (curIdx) {
                curIdx = curIdx + stepValue;
                const c: number = currentFind.findItems ? currentFind.findItems?.length : -1;
                if ((ri === currentFind.rowIndex) && (ci === currentFind.colIndex)) {
                    if (curIdx >= 0 && curIdx <= c) {
                        currentFind = <ICurrentFind>{
                            rowIndex: ri,
                            colIndex: ci,
                            currentFindItemIndex: curIdx,
                            findItems: this.getFindResult(ri, ci)
                        };
                    }
                }
            } else {
                [ri, ci] = this.findIndexToRowColumnIndex(globalFindIndex);
                currentFind = <ICurrentFind>{
                    rowIndex: ri,
                    colIndex: ci,
                    currentFindItemIndex: 0,
                    findItems: this.getFindResult(ri, ci)
                };
            }
            refiner.currentFind = currentFind;

            //Send event for informing refiner about its change in currentFind
            const cu: IContentUpdate = {
                viewKey: this.getCurrentFileOrFail().currentViewKey,
                range: [ri, ci, ri, ci]
            };
            this.dispatchEvent(new CustomEvent<IContentUpdate>('updateContent', {detail: cu}));

        }, 'doFindStep', ...arguments);
    }

    // Retrieves all occurrences for a given cell (row and column) across all refiners
    private doGetCellFindResult(rowIndex: number, columnIndex: number): IFindItem[][] {
        return errorCatch((rowIndex: number, columnIndex: number): IFindItem[][] => {
            const view: IView = this.getCurrentViewOrFail();
            const key: string = `${rowIndex}:${columnIndex}`;
            const combinedResults: IFindItem[][] = [];

            for (let i: number = 0; i < view.refiners.length; i++) {
                const refiner: IRefiner = view.refiners[i];
                const results: TFindResult = this.findResults[refiner.key];
                if (!results)
                    continue;
                const items: IFindItem[] = results[key];
                if (!items)
                    continue;
                combinedResults.push(items);
            }

            return combinedResults;
        }, 'doGetCellFindResult', ...arguments);
    }

    private doUpdateCame() {
        return errorCatch(() => {
            this.settings.aboutSettings.latestVersion = updateVersion(this.settings.aboutSettings.latestVersion);
            this.settings.updateData.latestVersion = this.settings.aboutSettings.latestVersion;
            this.settings.updateData.skippedUpdate = false;
            this.settings.updateData.installNextLaunch = this.settings.updateData.installNextLaunch ?? this.settings.aboutSettings.autoUpdateEnabled;
            this.settings.updateData.storageLocation = undefined;
            this.settings.updateData.isUpdateAvailable = true;
            this.settings.updateData.downloadProgress = undefined;
        }, 'doUpdateCame', ...arguments);
    }

    //Auto update
    //TODO: future correct error detection needed in case in any step error occurred, check, download or install
    private async doUpdateChecks(): Promise<void> {
        return await errorCatchAsync(async (): Promise<void> => {
            //This is where we check for an update in launch and for now, for testing purposes we have a new update every 3 startups
            this.downloadUpdateState = EDownloadUpdateState.None;
            const updateState: EUpdateState = this.getUpdateState();
            if ((updateState == EUpdateState.UpdateAvailableButNotDownloaded) && (!this.settings.updateData.skippedUpdate) && (this.settings.aboutSettings.autoUpdateEnabled))
                await this.downloadUpdate(true);
            else if ((updateState == EUpdateState.DownloadedReadyToInstall) && (this.settings.updateData.installNextLaunch || this.settings.aboutSettings.autoUpdateEnabled))
                await this.installUpdate();

            if (this.openCount % 3 == 0)
                this.doUpdateCame();

            // Initial check for updates on launch
            await this.checkForUpdate();

            // Set up 12 hours interval for updates
            setInterval(() => this.checkForUpdate(), updateIntervalInMS);

            //Check for update flow during app running
            // setInterval(() => this.doUpdateCame(), 10 * 1000);
            // setInterval(() => this.checkForUpdate(), 20 * 1000);

            //Check Network Error during app run after 10 second
            // await delay(10000);
            // this.doUpdateCame();
            // await this.checkForUpdate(true);
            // await delay(1000);

        }, 'doUpdateChecks', ...arguments);
    }

    private async downloadURLFaker(): Promise<void> {
        return await errorCatchAsync(async (): Promise<void> => {
            const totalTime: number = 5000;
            const progressStep: number = 10; // Progress increases by 10%
            const intervalTime: number = Math.round((totalTime * progressStep) / 100); // Time per progress step
            const totalFileSize: number = randomInt(1_000_000_000, 10_000_000_000);

            let su: IStatusUpdate;
            let elapsedTime: number = 0;
            let progress: number = 0;

            // Initialize the download task
            let downloadTask: ITask = {
                key: generateGUID(),
                type: ETaskType.Download,
                label: getTaskTypeDescription(ETaskType.Download),
                info: getText('task_type_waiting_desc'),
                description: getText('formatted_percent', (0).toString()),
                time: getText('formatted_time_ms', (0).toLocaleString()),
                state: ETaskState.Started
            };
            this.addOrUpdateTask(downloadTask);

            if (this.tasks === undefined)
                throw new Error(`Error in downloadURLFaker; this.tasks is undefined`);

            let updatedTasks: ITask[] = updateOrAddItemWithKey(
                this.tasks,
                {
                    key: downloadTask.key,
                    type: downloadTask.type,
                    label: downloadTask.label,
                    info: downloadTask.info,
                    description: downloadTask.description,
                    time: downloadTask.time,
                    state: downloadTask.state
                } as Partial<ITask>,
                'key'
            );
            await delay(100);

            // Dispatch the initial status bar event
            su = {
                type: getFileFormatDescription(currentFileFormat),
                dataMetrics: generateRandomDataMetrics(currentFileFormat, 0), // TODO: After implementing file size retrieval (e.g., from headers), replace this 0
                taskSummary: {
                    progressSummary: 0,
                    cancelable: isTaskCancelable(ETaskType.Download),
                    info: getTaskTypeDescription(ETaskType.Download),
                    description: (this.tasks.length > 1) ? downloadTask.info + ` (${this.tasks.length}/${this.tasks.length})` : downloadTask.info
                },
                tasks: updatedTasks
            };
            this.dispatchEvent(new CustomEvent<IStatusUpdate>('updateStatus', {detail: su}));

            // Increment progress every interval
            let currentTask: ITask | undefined;
            const interval: number = setInterval(() => {
                currentTask = this.tasks.find((t: ITask): boolean => (t.key === downloadTask.key));
                if (currentTask === undefined || currentTask.state === ETaskState.Canceled) {
                    downloadTask = {
                        ...downloadTask,
                        label: getTaskTypeLabel(ETaskType.Download) + ' (canceled)',
                        info: formatFileSize(totalFileSize * (progress / 100)),
                        description: getText('formatted_percent', (progress).toString()),
                        time: getText('formatted_time_ms', (elapsedTime).toLocaleString()),
                        state: ETaskState.Canceled
                    };
                    clearInterval(interval);
                } else {
                    progress += progressStep;
                    elapsedTime += intervalTime;

                    // Update the task with new progress and elapsed time
                    downloadTask = {
                        ...downloadTask,
                        label: (progress < 100) ? getTaskTypeDescription(ETaskType.Download) : getTaskTypeLabel(ETaskType.Download),
                        info: formatFileSize(totalFileSize * (progress / 100)),
                        description: getText('formatted_percent', (progress).toString()),
                        time: getText('formatted_time_ms', (elapsedTime).toLocaleString()),
                        ...(downloadTask.state === ETaskState.InProgress && progress < 100
                            ? {}
                            : {
                                state: progress < 100 ? ETaskState.InProgress : ETaskState.Finished
                            })
                    };
                }

                this.addOrUpdateTask(downloadTask);
                updatedTasks = updateOrAddItemWithKey(
                    this.tasks,
                    {
                        key: downloadTask.key,
                        label: downloadTask.label,
                        info: downloadTask.info,
                        description: downloadTask.description,
                        time: downloadTask.time,
                        ...(downloadTask.state === ETaskState.InProgress && progress < 100
                            ? {}
                            : {
                                state: progress < 100 ? ETaskState.InProgress : ETaskState.Finished
                            })
                    } as Partial<ITask>,
                    'key'
                );

                // Dispatch the updated status bar event
                if (currentTask === undefined || currentTask.state === ETaskState.Canceled) {
                    su = {
                        tasks: updatedTasks,
                        taskSummary: {
                            info: getText('formatted_info_rows_scanned', (Math.round((progress / 100) * this.getCurrentViewOrFail().rowCount)).toLocaleString()),
                            progressSummary: 100,
                            description: (this.tasks.length > 1) ? downloadTask.info + ` (${this.tasks.length}/${this.tasks.length})` : downloadTask.info
                        }
                    };
                } else {
                    const p: string = getText('formatted_description_size', formatFileSize(totalFileSize * (progress / 100) / (elapsedTime / 1000)));
                    if (progress === 100) {
                        su = {
                            tasks: updatedTasks,
                            taskSummary: {
                                info: getText('formatted_info_rows_scanned', (Math.round((progress / 100) * this.getCurrentViewOrFail().rowCount)).toLocaleString()),
                                description: p
                            }
                        };
                    } else {
                        su = {
                            tasks: updatedTasks,
                            taskSummary: {
                                progressSummary: progress,
                                description: (this.tasks.length > 1) ? p + ` (${this.tasks.length}/${this.tasks.length})` : p
                            }
                        };
                    }
                }

                this.dispatchEvent(new CustomEvent<IStatusUpdate>('updateStatus', {detail: su}));

                // Clear the interval and complete the task when progress reaches 100%
                if (progress >= 100)
                    clearInterval(interval);
            }, intervalTime);

            // Wait until the task completes
            await new Promise(resolve => {
                const checkCompletion: number = setInterval(() => {
                    if (progress >= 100) {
                        clearInterval(checkCompletion);
                        resolve(undefined);
                    }
                }, 100);
            });

        }, 'downloadURLFaker', ...arguments);
    }

    private async doOpenURL(params: IURLParams, showOkResult?: boolean): Promise<void> {
        return await errorCatchAsync(async (params: IURLParams, showOkResult?: boolean): Promise<void> => {

            if (!isValidURL(params.urlCredential.url)) {
                const validationResult: EURLValidationResult = EURLValidationResult.INVALID_URL;
                const our = <IOpenURLResult>{
                    isSuccess: isStatusOk(validationResult),
                    urlValidationResult: validationResult,
                    message: getURLValidationResultDetails(validationResult)
                };
                this.dispatchEvent(new CustomEvent<IOpenURLResult>('openURLResult', {detail: our}));
                return;
            }

            //TODO: actual URL header fetch validation
            // let result: EURLValidationResult;
            // validateAndProcessURL(params).then((value) => {
            //     result = value;
            //     if (value === EURLValidationResult.Ok)
            //         this.openFileSimulation(sampleFileName, sampleFilePath);
            // });

            //Update file authType to have it next time opening
            if (this.currentFile !== undefined) {
                this.currentFile.authType = params.urlCredential.authType;
                saveToLocalStorage('files', this.files);
            }

            this.doSaveURLCredentialsIfAllowed(params);

            await delay(250);
            const validationResult: EURLValidationResult = getValidationResult(showOkResult ? 1 : undefined);
            const our = <IOpenURLResult>{
                isSuccess: isStatusOk(validationResult),
                urlValidationResult: validationResult,
                message: getURLValidationResultDetails(validationResult)
            };
            this.dispatchEvent(new CustomEvent<IOpenURLResult>('openURLResult', {detail: our}));

            if (showOkResult) {
                await this.downloadURLFaker();
                await this.openFile('sampleFileName');
            }

        }, 'doOpenURL', ...arguments);
    }

    // Check if rememberCredentials is true, clone the credential, find existing by key or generate a new one, update or add
    private doSaveURLCredentialsIfAllowed(params: IURLParams) {
        errorCatch((params: IURLParams) => {
            if (!params.rememberCredentials)
                return;

            const newEntry: IURLCredential = {...params.urlCredential};

            if (newEntry.authType === EAuthenticationType.None)
                return;

            const urlCredentials: IURLCredential[] = loadFromLocalStorage('urlCredentials') || [];
            let existingIndex: number = urlCredentials.findIndex((entry: IURLCredential): boolean => ((entry.key === newEntry.key) || (entry.url === newEntry.url)));

            //Check for domain
            if ((existingIndex === -1) && (newEntry.saveMode === EURLCredentialSaveMode.Domain)) {
                newEntry.domain = extractDomain(newEntry.url);
                existingIndex = urlCredentials.findIndex((entry: IURLCredential) => (
                    entry.saveMode === EURLCredentialSaveMode.Domain &&
                    entry.domain === newEntry.domain
                ));
            }

            if (existingIndex === -1) {
                newEntry.key = generateGUID();
                newEntry.domain = extractDomain(params.urlCredential.url);
                urlCredentials.push(newEntry);
            } else {
                const {key, domain, ...rest} = newEntry;
                urlCredentials[existingIndex] = {
                    key: urlCredentials[existingIndex].key,
                    domain: urlCredentials[existingIndex].domain,
                    ...rest
                };
            }

            saveToLocalStorage('urlCredentials', urlCredentials);
        }, 'saveCredentialsToLocalStorage', ...arguments);
    }

    private doClearURLCredential(urlCredentialKey: string) {
        errorCatch((urlCredentialKey: string) => {
            let urlCredentials: IURLCredential[] = loadFromLocalStorage('urlCredentials') || [];
            urlCredentials = urlCredentials.filter((entry: IURLCredential): boolean => entry.key !== urlCredentialKey);
            saveToLocalStorage('urlCredentials', urlCredentials);
        }, 'doClearURLCredential', ...arguments);
    }

    private doClearAllURLCredentials() {
        errorCatch(() => {
            saveToLocalStorage('urlCredentials', []);
        }, 'doClearAllURLCredentials', ...arguments);
    }

    // Checks for an exact URL match (returning undefined if none), returns the credential immediately if saveMode=URL, otherwise compares domains and returns it if they match or undefined otherwise.
    private doFindURLCredential(url: string): IURLCredential | undefined {
        return errorCatch((url: string): IURLCredential | undefined => {
            const urlCredentials: IURLCredential[] = loadFromLocalStorage('urlCredentials') || [];
            const found: IURLCredential | undefined = urlCredentials.find((c: IURLCredential): boolean => (c.url === url));
            if (found)
                return found;
            const inputDomain: string = extractDomain(url);
            return urlCredentials.find((c: IURLCredential): boolean => (c.saveMode === EURLCredentialSaveMode.Domain) && (inputDomain === c.domain));
        }, 'doFindURLCredential', ...arguments);
    }

    private doGetCellContent(rowIndex: number, columnIndex: number): string {
        return errorCatch((rowIndex: number, columnIndex: number): string => {
            let content: string = this.getProductContent(rowIndex, columnIndex);
            const bannerText: string | undefined = this.getCurrentFile().bannerText;
            if ((bannerText) && (rowIndex % 10 !== 0))
                return redactChar.repeat(content.length);

            const findsInCell: IFindItem[][] = this.getFindResult(rowIndex, columnIndex);
            for (const finds of findsInCell) {
                for (const find of finds) {
                    if (find.color === EHighlightColor.Redact) {
                        const start: number = Math.max(0, find.from);
                        const end: number = Math.min(content.length, find.to);
                        const redactSegment: string = redactChar.repeat(end - start);
                        content = content.substring(0, start) + redactSegment + content.substring(end);
                    }
                }
            }

            return content;
        }, 'doGetCellContent', ...arguments);
    }

    // start of the public function definitions
    constructor() {
        super();
        this.files = loadFromLocalStorage('files') || [];
        this.settings = loadFromLocalStorage('settings') || getDefaultSettings();
        this.openCount = parseInt(loadFromLocalStorage('openCount', false) || '0');
        this.activeRefinerKey = undefined;
        this.startupScreenType = EStartupScreenType.Welcome;
        this.openCount++;

        this.doUpdateChecks();

        saveToLocalStorage('openCount', this.openCount);
        saveToLocalStorage('startupScreenType', this.startupScreenType);
        this.updateSettings();
    }

    initializeManager() {
        this.updateEmptyView();

        // Decide on startup screen type: if first time then show welcome screen, if not, show the update of the open count is mod 5
        let screenData: IStartupScreen | undefined = undefined;
        if (this.openCount == 1)
            screenData = <IStartupScreen>{
                type: EStartupScreenType.Welcome,
                title: getText('startup_dialog_welcome_title'),
                description: getText('startup_dialog_welcome_description'),
                features: [<IStartupScreenFeature>{
                    title: getText('startup_dialog_welcome_feature_1_title'),
                    description: getText('startup_dialog_welcome_feature_1_description'),
                }, <IStartupScreenFeature>{
                    title: getText('startup_dialog_welcome_feature_2_title'),
                    description: getText('startup_dialog_welcome_feature_2_description'),
                }, <IStartupScreenFeature>{
                    title: getText('startup_dialog_welcome_feature_3_title'),
                    description: getText('startup_dialog_welcome_feature_3_description'),
                }]
            };
        else if (this.settings.updateData.updateInstalled) {
            screenData = <IStartupScreen>{
                type: EStartupScreenType.Update,
                title: getText('startup_dialog_update_title'),
                description: getText('startup_dialog_update_description'),
                features: [<IStartupScreenFeature>{
                    title: getText('startup_dialog_update_feature_1_title'),
                    description: getText('startup_dialog_update_feature_1_description'),
                }, <IStartupScreenFeature>{
                    title: getText('startup_dialog_update_feature_2_title'),
                    description: getText('startup_dialog_update_feature_2_description'),
                }, <IStartupScreenFeature>{
                    title: getText('startup_dialog_update_feature_3_title'),
                    description: getText('startup_dialog_update_feature_3_description'),
                }, <IStartupScreenFeature>{
                    title: getText('startup_dialog_update_feature_4_title'),
                    description: getText('startup_dialog_update_feature_4_description'),
                }]
            };
            this.settings.updateData.updateInstalled = undefined;
            saveToLocalStorage('settings', this.settings);
        }

        if (screenData) {
            const ss = <IStartupScreen>{
                type: this.startupScreenType,
                title: screenData.title,
                description: screenData.description,
                features: screenData.features.map(feature => ({
                    title: feature.title,
                    description: feature.description
                }))
            }
            this.dispatchEvent(new CustomEvent<IStartupScreen>('startupScreen', {detail: ss}));
        }
    }

    startupScreenClosed(startupScreenType: EStartupScreenType) {
        this.startupScreenType = startupScreenType;
        saveToLocalStorage('startupScreenType', this.startupScreenType);
    }

    //Main Menu
    //File
    async openFile(fileName?: string): Promise<void> {
        return await errorCatchAsync(async (fileName?: string): Promise<void> => {
            //TODO: for now because we do not have proper open dialog, we build sample file names like this:
            const fn: string = fileName ? (sampleFileName) : (appendNumberToFilename(sampleFileName, this.openCount % 3));
            const fp: string = (this.openCount % 3 === 1) ? (sampleURLPath + fn) : (sampleFilePath + fn);
            return await this.openFileSimulation(fn, fp);
        }, 'openFile', ...arguments);
    }

    async openFolder(): Promise<void> {
        return await errorCatchAsync(async (): Promise<void> => {
            if (this.settings.accountAndLicense.license.level === 0) {
                const errorData: TDialogDetails | null = getErrorDetails(EErrorType.UnionFeatureUpgradeRequired);
                if (errorData) {
                    const e: IError = {
                        type: EErrorType.UnionFeatureUpgradeRequired,
                        title: errorData.title,
                        message: errorData.message
                    };
                    this.dispatchEvent(new CustomEvent<IError>('error', {detail: e}));
                }
            } else
                return await this.openFile('sampleFileName'); //TODO replace with open folder code
        }, 'openFolder', ...arguments);
    }

    //Open URL
    //This is used to actually go for the download of the url, but first its checking whether to give an error
    //TODO: showOkResult is just for getting error or ok result to check UI for now
    async openURL(params: IURLParams, showOkResult?: boolean): Promise<void> {
        return await errorCatchAsync(async (params: IURLParams, showOkResult?: boolean): Promise<void> => {
            await this.doOpenURL(params, showOkResult);
        }, 'openURL', ...arguments);
    }

    findURLCredential(url: string): IURLCredential | undefined {
        return errorCatch((url: string): IURLCredential | undefined => {
            return this.doFindURLCredential(url);
        }, 'findURLCredential', ...arguments);
    }

    clearURLCredential(urlCredentialKey: string) {
        errorCatch((urlCredentialKey: string) => {
            this.doClearURLCredential(urlCredentialKey);
        }, 'clearURLCredential', ...arguments);
    }

    clearAllURLCredentials() {
        errorCatch(() => {
            this.doClearAllURLCredentials();
        }, 'clearAllURLCredentials', ...arguments);
    }

    //This function saved the user preference of saving the open URL credentials to be URL or Domain for the now on
    setURLCredentialSaveMode(urlCredentialSaveMode: EURLCredentialSaveMode) {
        errorCatch((urlCredentialSaveMode: EURLCredentialSaveMode) => {
            this.settings.urlCredentialSaveMode = urlCredentialSaveMode;
            saveToLocalStorage('settings', this.settings);
        }, 'setURLCredentialSaveMode', ...arguments);
    }

    //This function should be used to get the value of the switch in context menu of the credential manager in open URL dialog
    getURLCredentialSaveMode(): EURLCredentialSaveMode {
        return errorCatch((): EURLCredentialSaveMode => {
            return this.settings.urlCredentialSaveMode;
        }, 'getURLCredentialSaveMode', ...arguments);
    }

    getURLCredentials(): IURLCredentialEx[] {
        return errorCatch((): IURLCredentialEx[] => {
            const URLCredentials: IURLCredential[] = loadFromLocalStorage('urlCredentials') || [];

            return URLCredentials.map((item: IURLCredential): IURLCredentialEx => ({
                URLCredential: item,
                shortenedURL: trimStringMiddle(item.url)
            }));

        }, 'getURLCredentials', ...arguments);
    }

    async openFromClipboard(): Promise<void> {
        return await errorCatchAsync(async (): Promise<void> => {
            getFromClipboard().then(text => {
                this.openFileSimulation(sampleFileName, sampleFilePath + sampleFileName);
            });
        }, 'openFromClipboard', ...arguments);
    }

    async openRecentFile(fileKey: string): Promise<void> {
        return await errorCatchAsync(async (fileKey: string): Promise<void> => {
            if (this.files === undefined)
                throw new Error(`Error in openRecentFile; this.files is undefined. fileKey: ${fileKey}`);
            const file: IFile | undefined = this.files.find(f => f.key === fileKey);
            if (file === undefined)
                throw new Error(`Error in openRecentFile; no file for fileKey: ${fileKey}`);
            await this.openFileSimulation(file.name, file.path);
        }, 'openRecentFile', ...arguments);
    }

    // Sort files by 'updatedAt' in descending order and return the top 10
    getRecentFiles(): IFileEx[] {
        return errorCatch((): IFileEx[] => {
            if (this.files === undefined)
                throw new Error(`Error in getRecentFiles; this.files is undefined`);
            const recentFilesKeys: string[] = loadFromLocalStorage('recentFilesKeys') || [];
            const cleanRecentFilesList: IFileEx[] = getCleanRecentFilesList(this.files, recentFilesKeys);

            return cleanRecentFilesList.map((item: IFileEx) => ({
                ...item,
                shortenedToolTipPath: trimStringMiddle(item.file.path)
            }));
        }, 'getRecentFiles', ...arguments);
    }

    openFileLocation() {
        //TODO
    }

    clearRecentFiles() {
        return errorCatch(() => {
            if (this.files === undefined)
                throw new Error(`Error in clearRecentFiles; this.files is undefined`);
            return this.doClearRecentFiles();
        }, 'clearRecentFiles', ...arguments);
    }

    openDropFile() {
        //TODO later
    }

    async exportFile(exportDetails: IExportDetails): Promise<void> {
        return await errorCatchAsync(async (exportDetails: IExportDetails): Promise<void> => {

            //TODO: check after view management for if this is needed
            //TODO: check export to not include hidden columns in the export

            // const file = this.getCurrentFileOrFail();
            // if ((file.views.length <= 1) && (exportOptions.scope == EExportScope.AllViews))
            //     throw new Error(`Error in exportFile; can not have 'AllViews' scope when views are below or equal to 1`);

            return this.doExportFile(exportDetails);
        }, 'exportFile', ...arguments);
    }

    // Window management methods
    newWindow() {
        //TODO later
    }

    closeWindow() {
        //TODO later
    }

    //This function is for copying csv data by selection, pass no input param to copy all data
    async copyData(exportDetails?: IExportDetails): Promise<void> {
        return await errorCatchAsync(async (exportDetails: IExportDetails): Promise<void> => {
            let ranges: TRange[] = [];
            if (exportDetails) {
                if (exportDetails.ranges === undefined)
                    throw new Error(`Error in copyData; exportDetails.ranges is undefined`);
                ranges = exportDetails.ranges;
            } else {
                if (!this.currentFileOriginalInfo)
                    throw new Error('Error in copyData; currentFileOriginalInfo is undefined');
                ranges = [[0, 0, this.currentFileOriginalInfo!?.rowCount, this.currentFileOriginalInfo!?.columns.length]]
            }
            const rangeContent = this.getProductRangeContent(ranges);
            return await copyToClipboard(rangeContent);
        }, 'copyData', ...arguments);
    }

    //Menu view
    //TODO: Once in each 5 run, refresh data by open file for now, later after adding core, make this for al the times
    async refreshData(): Promise<void> {
        return await errorCatchAsync(async (): Promise<void> => {
            if (this.openCount % 5 == 1)
                await this.doOpenFileByKey(this.getCurrentFileOrFail().key);
        }, 'refreshData', ...arguments);
    }

    //Load data
    // UI interactions with data
    getCellContent(rowIndex: number, columnIndex: number): string {
        return errorCatch((rowIndex: number, columnIndex: number): string => {
            return this.doGetCellContent(rowIndex, columnIndex);
        }, 'getCellContent', ...arguments);
    }

    getRowsContent(fromRowIndex: number, toRowIndex: number): string[][] {
        return errorCatch((fromRowIndex: number, toRowIndex: number): string[][] => {

            // Validate indices
            if (fromRowIndex < 0)
                throw new Error(`Error in getRowsContent; fromRowIndex is below 0; fromRowIndex: ${fromRowIndex}`);
            if (toRowIndex > this.products.length - 1)
                throw new Error(`Error in getRowsContent; toRowIndex exceeds products length; toRowIndex: ${toRowIndex}`);
            if (fromRowIndex > toRowIndex)
                throw new Error(`Error in getRowsContent; fromRowIndex is greater than toRowIndex; fromRowIndex: ${fromRowIndex}, toRowIndex: ${toRowIndex}`);

            return this.products.slice(fromRowIndex, toRowIndex + 1);
        }, 'getRowsContent', ...arguments);
    }

    setFilterMode(filterMode: EFilterMode) {
        errorCatch((filterMode: EFilterMode) => {
            const view: IView = this.getCurrentViewOrFail();
            view.filterMode = filterMode;
            const vu: IViewUpdate = {viewKey: view.key, filterMode: view.filterMode};

            // Append editor details if the filter mode is SQL
            if (view.filterMode === EFilterMode.SQL)
                vu.editor = view.editor
            this.dispatchEvent(new CustomEvent<IViewUpdate>('updateViewSync', {detail: vu}));
            saveToLocalStorage('files', this.files);
            this.doViewRefiners(view); //Do refiner job first time toggling between filter modes
        }, 'setFilterMode', ...arguments);
    }

    //Refiners
    addRefiner(refiner: IRefiner) {
        errorCatch((refiner: IRefiner) => {
            //This assignment is valid and does not need cloning because the input is being created from scratch from UI side
            refiner.key = generateGUID();
            const view: IView = this.getCurrentViewOrFail();
            insertIntoArray(view.refiners, refiner, 'bottom');
            saveToLocalStorage('files', this.files);

            const updatedRefiners = updateOrAddItemWithKey(
                view.refiners,
                {
                    key: refiner.key,
                    type: refiner.type,
                    columns: refiner.columns,
                    highlight: refiner.highlight,
                    inverse: refiner.inverse,
                    content: refiner.content,
                    resultCount: refiner.resultCount,
                    currentFind: refiner.currentFind
                } as Partial<IRefiner>,
                'key'
            );

            const vu: IViewUpdate = {viewKey: view.key, refiners: updatedRefiners};
            this.dispatchEvent(new CustomEvent<IViewUpdate>('updateView', {detail: vu}));
            this.dispatchEvent(new CustomEvent<IViewUpdate>('updateViewSync', {detail: vu}));
        }, 'addRefiner', ...arguments);
    }

    duplicateRefiner(refiner: IRefiner) {
        errorCatch((refiner: IRefiner) => {
            const newRefiner: IRefiner = cloneRefiner(refiner);

            this.addRefiner(newRefiner);

            if (newRefiner.type === undefined)
                throw new Error(`Error in duplicateRefiner; refiner.type is undefined for refiner: ${refiner.key}`);

            // In duplicate refiner do the refiner job right away
            this.doRefiner(newRefiner.key, newRefiner.type);
        }, 'duplicateRefiner', ...arguments);
    }

    removeRefiner(refinerKey: string) {
        errorCatch((refinerKey: string) => {
            const view: IView = this.getCurrentViewOrFail();
            view.refiners = view.refiners.filter(r => r.key !== refinerKey);

            //Remove this refiner's results from the overall find results object
            delete this.findResults[refinerKey];

            //TODO: deleting a filter refiner should be affecting rows in grid data

            //Tell other instances about this refiner removal
            const updatedRefiners: IRefiner[] = view.refiners.map(r => ({key: r.key} as IRefiner));
            const vu: IViewUpdate = {viewKey: view.key, refiners: updatedRefiners};
            this.dispatchEvent(new CustomEvent<IViewUpdate>('updateViewSync', {detail: vu}));

            saveToLocalStorage('files', this.files);
        }, 'removeRefiner', ...arguments);
    }

    updateRefinerOrder(refinerKey: string, index: number) {
        errorCatch((refinerKey: string, index: number) => {
            if (index < 0)
                throw new Error(`Error in updateRefinerOrder; destination index is negative: ${index}; refinerKey: ${refinerKey}`);

            const view: IView = this.getCurrentViewOrFail();
            const refiners: IRefiner[] = view.refiners;
            const refinerIndex: number = refiners.findIndex(r => r.key === refinerKey);
            const [movedItem] = refiners.splice(refinerIndex, 1); // Remove the item from its current position
            if (movedItem === undefined)
                throw new Error(`Error in updateRefinerOrder; movedItem is undefined`);

            // Insert the item at the destination index
            refiners.splice(index, 0, movedItem);

            //Tell about this change to other instances
            const updatedRefiners: IRefiner[] = view.refiners.map(r => ({key: r.key} as IRefiner));
            const vu: IViewUpdate = {viewKey: view.key, refiners: updatedRefiners};
            this.dispatchEvent(new CustomEvent<IViewUpdate>('updateViewSync', {detail: vu}));

            saveToLocalStorage('files', this.files);
        }, 'updateRefinerOrder', ...arguments);
    }

    //Use these update refiners helper functions for the editor refiner too.
    updateRefinerType(refinerKey: string, refinerType: ERefinerType) {
        errorCatch((refinerKey: string, refinerType: ERefinerType) => {
            const refiner: IRefiner = this.getRefinerByKeyOrFail(refinerKey);
            refiner.type = refinerType;
            saveToLocalStorage('files', this.files);
            this.updateViewSyncWithRefiner(refiner.key, {type: refiner.type});
            this.doRefiner(refinerKey, refinerType);
        }, 'updateRefinerType', ...arguments);
    }

    updateRefinerInverse(refinerKey: string, inverse: boolean) {
        errorCatch((refinerKey: string, inverse: boolean) => {
            const refiner: IRefiner = this.getRefinerByKeyOrFail(refinerKey);
            refiner.inverse = inverse;
            if (refiner.type === undefined)
                throw new Error(`Error in updateRefinerInverse; refiner.type is undefined`);
            saveToLocalStorage('files', this.files);
            this.updateViewSyncWithRefiner(refiner.key, {inverse: refiner.inverse});
            this.doRefiner(refinerKey, refiner.type);
        }, 'updateRefinerInverse', ...arguments);
    }

    // Updates the highlight color for a specific refiner.
    updateRefinerHighlight(refinerKey: string, highlight: EHighlightColor) {
        errorCatch((refinerKey: string, highlight: EHighlightColor) => {
            const refiner: IRefiner = this.getRefinerByKeyOrFail(refinerKey);
            refiner.highlight = highlight;
            if (refiner.type === undefined)
                throw new Error(`Error in updateRefinerHighlight; refiner.type is undefined`);
            saveToLocalStorage('files', this.files);
            this.updateViewSyncWithRefiner(refiner.key, {highlight: refiner.highlight});
            this.doRefiner(refinerKey, refiner.type);
        }, 'updateRefinerHighlight', ...arguments);
    }

    //This is array of the keys of the columns
    updateRefinerColumns(refinerKey: string, columns: string[]) {
        errorCatch((refinerKey: string, columns: string[]) => {
            const refiner: IRefiner = this.getRefinerByKeyOrFail(refinerKey);
            refiner.columns = columns;
            if (refiner.type === undefined)
                throw new Error(`Error in updateRefinerColumns; refiner.type is undefined`);
            saveToLocalStorage('files', this.files);
            this.updateViewSyncWithRefiner(refiner.key, {columns: refiner.columns});
            this.doRefiner(refinerKey, refiner.type);
        }, 'updateRefinerColumns', ...arguments);
    }

    updateRefinerContent(refinerKey: string, content: string) {
        errorCatch((refinerKey: string, content: string) => {
            const refiner: IRefiner = this.getRefinerByKeyOrFail(refinerKey);
            refiner.content = content;
            if (refiner.type === undefined)
                throw new Error(`Error in updateRefinerContent; refiner.type is undefined`);
            saveToLocalStorage('files', this.files);
            this.updateViewSyncWithRefiner(refiner.key, {content: refiner.content});
            this.doRefiner(refinerKey, refiner.type);
        }, 'updateRefinerContent', ...arguments);
    }

    setActiveRefinerKey(refinerKey: string) {
        this.activeRefinerKey = refinerKey;
    }

    getActiveRefinerKey(): string {
        return errorCatch((): string => {
            if (this.activeRefinerKey === undefined)
                throw new Error(`this.activeRefinerKey is undefined`);
            return this.activeRefinerKey;
        }, 'getActiveRefinerKey', ...arguments);
    }

    //Note: These functions provide direct access to file, view, and refiner objects. Use cautiously and avoid reassigning these objects, as it modifies the manager's data.
    getCurrentFile(): IFile {
        return errorCatch((): IFile => {
            return this.getCurrentFileOrFail();
        }, 'getCurrentFile', ...arguments);
    }

    getCurrentView(): IView {
        return errorCatch((): IView => {
            return this.getCurrentViewOrFail();
        }, 'getCurrentView', ...arguments);
    }

    getCurrentViewMode(): EViewMode {
        return errorCatch((): EViewMode => {
            return this.doGetCurrentViewMode();
        }, 'getCurrentViewMode', ...arguments);
    }

    getViewByKey(viewKey: string): IView {
        return errorCatch((viewKey: string): IView => {
            return this.getViewByKeyOrFail(viewKey);
        }, 'getViewByKey', ...arguments);
    }

    getRefinerByKey(refinerKey: string): IRefiner {
        return errorCatch((refinerKey: string): IRefiner => {
            return this.getRefinerByKeyOrFail(refinerKey);
        }, 'getRefinerByKey', ...arguments);
    }

    //View
    //Add to the start of the list in simple add and no second param, and for duplicate specify index
    addView(view: IView, position: 'top' | 'bottom' | number = 'top') {
        errorCatch((view: IView, position: 'top' | 'bottom' | number = 'top') => {
            let newView: IView = view;
            const file: IFile = this.getCurrentFileOrFail();

            // In first add, clone because from UI the view input is being passed from the default/first view
            if (file.views.length === 1)
                newView = cloneView(newView);
            else
                newView.key = generateGUID();

            //This assignment is valid and does not need cloning because the input is being created from scratch from UI side
            insertIntoArray(file.views, newView, position === 'top' ? 1 : position);
            file.currentViewKey = newView.key; //Set current view to this new view

            const vu: IViewUpdate = {
                viewKey: newView.key,
                name: newView.name,
                filePath: newView.filePath,
                viewMode: newView.viewMode,
                filterMode: newView.filterMode
            };
            this.dispatchEvent(new CustomEvent<IViewUpdate>('updateView', {detail: vu}));
            this.dispatchEvent(new CustomEvent<IViewUpdate>('updateViewSync', {detail: vu}));

            this.setCurrentView(file.currentViewKey, newView);
            saveToLocalStorage('files', this.files);
            this.dispatchUpdateViews();
        }, 'addView', ...arguments);
    }

    updateViewName(viewKey: string, name: string) {
        errorCatch((viewKey: string, name: string) => {
            const view: IView = this.getViewByKeyOrFail(viewKey);
            if (view === undefined)
                throw new Error(`Error in renameView; view with key: ${viewKey} is undefined`);
            view.name = name;

            const currentView: IView = this.getCurrentViewOrFail();
            if (viewKey === currentView.key) {
                const vu: IViewUpdate = {viewKey: currentView.key, name: name};
                this.dispatchEvent(new CustomEvent<IViewUpdate>('updateViewSync', {detail: vu}));
            }

            saveToLocalStorage('files', this.files);
            this.dispatchUpdateViews();
        }, 'updateViewName', ...arguments);
    }

    removeView(viewKey: string) {
        errorCatch((viewKey: string) => {
            const file: IFile = this.getCurrentFileOrFail();
            if (file.views.length === 1)
                throw new Error(`Error in removeView; can not remove first and only view; file.views[0].key: ${viewKey}`);

            const viewIndex: number = file.views.findIndex(v => v.key === viewKey);

            //Save the current view key so that if the view that is being deleted is the current view then set current view to the view after it
            const previousCurrentViewKey: string = file.currentViewKey;

            // for deleting last view, and keeping the default, just replace the second with first then delete second
            if ((viewIndex === 1) && (file.views.length === 2)) {
                file.views[0] = {...cloneView(file.views[1]), key: file.views[0].key, name: file.views[0].name};
                this.setCurrentView(file.views[0].key, file.views[0]);
            }

            //Remove the view from views list
            file.views = file.views.filter(v => v.key !== viewKey);

            //If the view that is being deleted was the current view then set current view to the view after it
            if ((viewKey === previousCurrentViewKey) && (file.views.length > 1)) {
                const v: IView = file.views[Math.min(viewIndex, file.views.length - 1)];
                this.setCurrentView(v.key, v);
            }
            saveToLocalStorage('files', this.files);
            this.dispatchUpdateViews();
        }, 'removeView', ...arguments);
    }

    //Give the view that you want to duplicate from it in input
    duplicateView(view: IView) {
        errorCatch((view: IView) => {
            const file: IFile = this.getCurrentFileOrFail();
            const viewIndex: number = file.views.findIndex(v => v.key === view.key);
            if (viewIndex === -1)
                throw new Error(`Error in duplicateView; no view found for key: ${view.key}`);
            const newView: IView = cloneView(view);
            this.addView(newView, viewIndex);

            //Do all the refiners or sql area stuff (based on the current filter mode of the view) after duplicate view
            this.doViewRefiners(newView);
        }, 'duplicateView', ...arguments);
    }

    updateViewOrder(viewKey: string, index: number) {
        errorCatch((viewKey: string, index: number) => {
            if (index < 0)
                throw new Error(`Error in updateViewOrder; invalid destination index: ${index}; viewKey: ${viewKey}`);

            const file: IFile = this.getCurrentFileOrFail();
            const views: IView[] = file.views;
            const sourceViewIndex: number = file.views.findIndex(v => v.key === viewKey);

            // Remove the item from its current position and insert at the destination index
            const [movedItem]: IView[] = views.splice(sourceViewIndex, 1);
            if (movedItem === undefined)
                throw new Error(`Error in updateViewOrder; movedItem is undefined`);
            views.splice(index, 0, movedItem);

            saveToLocalStorage('files', this.files);
            this.dispatchUpdateViews();
        }, 'updateViewOrder', ...arguments);
    }

    setCurrentView(viewKey: string, view: IView | undefined = undefined) {
        errorCatch((viewKey: string, view: IView | undefined = undefined) => {
            this.doSetCurrentView(viewKey, view);
            if (this.currentView) {
                const vu: IViewUpdate = {
                    viewKey: this.currentView.key,
                    name: this.currentView.name,
                    filePath: this.currentView.filePath,
                    viewMode: this.currentView.viewMode,
                    filterMode: this.currentView.filterMode,
                    columns: this.currentView.columns,
                    rowCount: this.currentView.rowCount,
                    refiners: this.currentView.refiners
                };

                if (this.currentView.editor !== undefined)
                    vu.editor = this.currentView.editor;

                this.dispatchEvent(new CustomEvent<IViewUpdate>('updateView', {detail: <IViewUpdate>vu}));
                this.dispatchEvent(new CustomEvent<IViewUpdate>('updateViewSync', {detail: <IViewUpdate>vu}));
                saveToLocalStorage('files', this.files);
            } else
                throw new Error(`Error in setCurrentView; this.currentView is undefined; viewKey: ${viewKey}`);
        }, 'setCurrentView', ...arguments);
    }

    //Set viewMode of the current view
    setViewMode(viewMode: EViewMode) {
        errorCatch((viewMode: EViewMode) => {
            const view: IView = this.getCurrentViewOrFail();
            view.viewMode = viewMode;

            const vu: IViewUpdate = {viewKey: view.key, viewMode: view.viewMode};
            this.dispatchEvent(new CustomEvent<IViewUpdate>('updateViewSync', {detail: vu}));

            saveToLocalStorage('files', this.files);
        }, 'setViewMode', ...arguments);
    }

    getOriginalColumns(): IColumn[] {
        return errorCatch((): IColumn[] => {
            if (!this.currentFileOriginalInfo)
                throw new Error('Error in getOriginalColumns; currentFileOriginalInfo is undefined');
            return this.currentFileOriginalInfo.columns;
        }, 'getOriginalColumns', ...arguments);
    }

    getOriginalRowCount(): EViewMode {
        return errorCatch((): EViewMode => {
            if (!this.currentFileOriginalInfo)
                throw new Error('Error in getOriginalRowCount; currentFileOriginalInfo is undefined');
            return this.currentFileOriginalInfo.rowCount;
        }, 'getOriginalRowCount', ...arguments);
    }

    getOriginalViewMode(): number {
        return errorCatch((): number => {
            if (!this.currentFileOriginalInfo)
                throw new Error('Error in getOriginalViewMode; currentFileOriginalInfo is undefined');
            return this.currentFileOriginalInfo.viewMode;
        }, 'getOriginalViewMode', ...arguments);
    }

    //Cast from current file views to use in 'IViewUpdates' update events
    getCurrentFileViewNames(): IViewUpdates {
        return errorCatch((): IViewUpdates => {
            return {
                views: this.getCurrentFileOrFail().views.map((view: IView) => ({
                    key: view.key,
                    name: view.name
                })),
            };
        }, 'getCurrentFileViewNames', ...arguments);
    }

    //Find
    // Retrieves all occurrences for a given cell (row and column) across all refiners
    getFindResult(rowIndex: number, columnIndex: number): IFindItem[][] {
        return errorCatch((rowIndex: number, columnIndex: number): IFindItem[][] => {
            return this.doGetCellFindResult(rowIndex, columnIndex);
        }, 'getFindResult', ...arguments);
    }

    // Fetching the (row, col) index for a specific find global position
    findIndexToRowColumnIndex(findIndex: number): [number, number] {
        return errorCatch((findIndex: number): [number, number] => {
            const results: TFindResult = this.findResults[this.getActiveRefinerKey()] || {};
            const keys: string [] = Object.keys(results);
            const key: string = keys[findIndex];
            return [key ? parseInt(key.split(':')[0]) : -1, key ? parseInt(key.split(':')[1]) : -1];
        }, 'findIndexToRowColumnIndex', ...arguments);
    }

    goToNextFind(globalFindIndex: number) {
        errorCatch((globalFindIndex: number) => {
            this.doFindStep(globalFindIndex, 1);
        }, 'goToNextFind', ...arguments);
    }

    goToPreviousFind(globalFindIndex: number) {
        errorCatch((globalFindIndex: number) => {
            this.doFindStep(globalFindIndex, -1);
        }, 'goToPreviousFind', ...arguments);
    }

    //Column
    updateColumnWidth(columnKey: string, width: number) {
        errorCatch((columnKey: string, width: number) => {
            const view: IView = this.getCurrentViewOrFail();
            const c: IColumn = this.doGetColumnByKey(columnKey, view);
            c.width = width;
            this.dispatchUpdateViewColumns({key: c.key, width: c.width} as Partial<IColumn>, view);
        }, 'updateColumnWidth', ...arguments);
    }

    sortColumn(columnKey: string, sort: ESort) {
        errorCatch((columnKey: string, sort: ESort) => {
            const view: IView = this.getCurrentViewOrFail();
            const c: IColumn = this.doGetColumnByKey(columnKey, view);
            c.sort = sort;
            this.dispatchUpdateViewColumns({key: c.key, sort: c.sort} as Partial<IColumn>, view);

            // Update content
            const cu: IContentUpdate = {
                viewKey: this.getCurrentView().key,
                range: [0, 0, this.currentFileOriginalInfo?.rowCount ?? 0, this.currentFileOriginalInfo?.columns.length ?? 0]
            };
            this.dispatchEvent(new CustomEvent<IContentUpdate>('updateContent', {detail: cu}));

        }, 'sortColumn', ...arguments);
    }

    showHideColumn(columnKey: string, visible: boolean) {
        errorCatch((columnKey: string, visible: boolean) => {
            const view: IView = this.getCurrentViewOrFail();
            const c: IColumn = this.doGetColumnByKey(columnKey, view);
            c.visible = visible;
            this.dispatchUpdateViewColumns({key: c.key, visible: c.visible} as Partial<IColumn>, view);
        }, 'showHideColumn', ...arguments);
    }

    setColumnOrder(columnKey: string, index: number) {
        errorCatch((columnKey: string, index: number) => {
            const view: IView = this.getCurrentViewOrFail();
            const columns: IColumn[] = view.columns;
            const columnIndex: number = columns.findIndex(c => c.key === columnKey);

            // Remove the item from its current position and insert the item at the destination index
            const [movedItem] = columns.splice(columnIndex, 1);
            columns.splice(index, 0, movedItem);
            this.getCurrentViewOrFail().columns = columns;
            saveToLocalStorage('files', this.files);

            const vu: IViewUpdate = {viewKey: view.key, columns: columns};
            this.dispatchEvent(new CustomEvent<IViewUpdate>('updateViewSync', {detail: vu}));

        }, 'setColumnOrder', ...arguments);
    }

    getColumnByKey(columnKey: string): IColumn {
        return errorCatch((columnKey: string): IColumn => {
            return this.doGetColumnByKey(columnKey);
        }, 'getColumnByKey', ...arguments);
    }

    // Methods for query execution
    async executeQuery(): Promise<void> {
        return await errorCatchAsync(async (): Promise<void> => {
            await this.doExecuteQuerySimulation();
        }, 'executeQuery', ...arguments);
    }

    addEditorRefiner(refiner: IRefiner) {
        errorCatch((refiner: IRefiner) => {
            const view: IView = this.getCurrentViewOrFail();
            const editor: IEditor = view.editor;
            refiner.key = generateGUID();
            editor.refiner = refiner; //No need to clone because the input refiner is being created from scratch in UI side
            saveToLocalStorage('files', this.files);

            const vu: IViewUpdate = {
                viewKey: view.key,
                editor: <IEditor>{
                    refiner: refiner
                }
            };
            this.dispatchEvent(new CustomEvent<IViewUpdate>('updateView', {detail: vu}));
            this.dispatchEvent(new CustomEvent<IViewUpdate>('updateViewSync', {detail: vu}));

            //Reset find results, when we are adding the refiner of the editor
            this.findResults = {};

        }, 'addEditorRefiner', ...arguments);
    }

    removeEditorRefiner() {
        errorCatch(() => {
            const view: IView = this.getCurrentViewOrFail();
            const {refiner, ...rest} = view.editor;
            view.editor = rest;
            this.findResults = {};
            this.updateViewForEditor(<IEditor>{});
        }, 'removeEditorRefiner', ...arguments);
    }

    updateEditorCode(code: string) {
        errorCatch((code: string) => {
            const view: IView = this.getCurrentViewOrFail();
            view.editor.code = code;
            this.updateViewForEditor(<IEditor>{code: code});
        }, 'updateEditorCode', ...arguments);
    }

    terminateQuery() {
        errorCatch(() => {
            this.doTerminateQuery();
        }, 'terminateQuery', ...arguments);
    }

    // Tasks
    cancelCurrentTask() {
        errorCatch(() => {
            const currentTask: ITask | undefined = this.tasks.find((t: ITask): boolean => t.state === ETaskState.InProgress);
            if (currentTask)
                this.doCancelTask(currentTask);
        }, 'cancelCurrentTask', ...arguments);
    }

    // Settings and license
    getSettings(): ISettings {
        return this.settings;
    }

    async login(email: string, password: string): Promise<Error | undefined> {
        return await errorCatchAsync(
            async (email: string, password: string): Promise<Error | undefined> => {
                const usersInfo: IUsersInfo = {
                    Free: {
                        email: getText('user_free_email'),
                        name: getText('user_free_name'),
                        password: getText('user_free_password'),
                    },
                    Standard: {
                        email: getText('user_standard_email'),
                        name: getText('user_standard_name'),
                        password: getText('user_standard_password'),
                    },
                    Pro: {
                        email: getText('user_pro_email'),
                        name: getText('user_pro_name'),
                        password: getText('user_pro_password'),
                    },
                };

                const licenseLevelMap = {
                    Free: 0,
                    Standard: 1,
                    Pro: 2,
                } as const;

                await delay(100);

                for (const userType in usersInfo) {
                    const typedUserType = userType as keyof IUsersInfo;
                    const user: IUserInfo = usersInfo[typedUserType];

                    if (user.email === email) {
                        if (user.password === password) {
                            this.settings.accountAndLicense.user = {
                                email: user.email,
                                name: user.name,
                                password: user.password,
                            };
                            const licenseLevel = licenseLevelMap[typedUserType];
                            this.settings.accountAndLicense.license = {
                                level: licenseLevel,
                                state: ELicenseState.Active,
                                title: userType,
                            };
                            this.updateLicenseInfo(this.settings.accountAndLicense.license);
                            this.updateSettings();
                            return undefined;
                        } else
                            throw new Error(`Password is wrong for user: ${email}.`);
                    }

                }
                throw new Error(`User ${email} does not exist.`);
            }, "login", ...arguments);
    }

    createAccount(email: string, name: string, password: string) {
        //TODO later
    }

    upgradeLicense(licenseLevel: number) {
        errorCatch((licenseLevel: number) => {
            const license: ILicense = this.settings.accountAndLicense.license;
            license.level = licenseLevel;
            this.updateLicenseInfo(license);
        }, 'upgradeLicense', ...arguments);
    }

    signOut() {
        errorCatch(() => {
            this.settings.accountAndLicense.user = undefined;
            this.settings.accountAndLicense.license = {
                level: 0,
                state: ELicenseState.Active,
                title: getText('app_default_license_name')
            };
            this.updateSettings();
        }, 'signOut', ...arguments);
    }

    contactSupport() {
        return errorCatch(() => {
            openMailApp(getText('app_info_contact_us'));
        }, 'contactSupport', ...arguments);
    }

    async addActivationKey(file: File): Promise<Error | undefined> {
        return await errorCatchAsync(async (file: File): Promise<Error | undefined> => {
            await delay(100);
            const value: boolean = await checkOfflineActivation(file);
            if (value)
                return await this.login(getText('user_standard_name'), getText('user_standard_password'));

            const errorData: TDialogDetails | null = getErrorDetails(EErrorType.OfflineActivationError);
            if (errorData) {
                const e: IError = {
                    type: EErrorType.OfflineActivationError,
                    title: errorData.title,
                    message: errorData.message
                };
                this.dispatchEvent(new CustomEvent<IError>('error', {detail: e}));
            }

        }, 'addActivationKey', ...arguments);
    }

    async copyHardwareID(hardwareID: string): Promise<void> {
        return await errorCatchAsync(async (hardwareID: string): Promise<void> => {
            return await copyToClipboard(hardwareID);
        }, 'copyHardwareID', ...arguments);
    }

    getLicenseLevel(): number {
        return errorCatch((): number => {
            return this.settings.accountAndLicense.license.level;
        }, 'getLicenseLevel', ...arguments);
    }

    getLicenseState(): ELicenseState {
        return errorCatch((): ELicenseState => {
            return this.settings.accountAndLicense.license.state;
        }, 'getLicenseState', ...arguments);
    }

    setTheme(theme: ETheme) {
        errorCatch((theme: ETheme) => {
            this.settings.appearanceSettings.theme = theme;
            this.updateSettings(true, false);
        }, 'setTheme', ...arguments);
    }

    setSqlEditorSyntaxHighlighting(sqlEditorSyntaxHighlighting: ESqlEditorSyntaxHighlighting) {
        errorCatch((sqlEditorSyntaxHighlighting: ESqlEditorSyntaxHighlighting) => {
            this.settings.appearanceSettings.sqlEditorSyntaxHighlighting = sqlEditorSyntaxHighlighting;
            this.updateSettings(true, false);
        }, 'setSqlEditorSyntaxHighlighting', ...arguments);
    }

    setRowShading(rowShading: ERowShading) {
        errorCatch((rowShading: ERowShading) => {
            this.settings.appearanceSettings.rowShading = rowShading;
            this.updateSettings(true, false);
        }, 'setRowShading', ...arguments);
    }

    setUIScaling(uiScaling: number) {
        return errorCatch((uiScaling: number) => {
            this.settings.appearanceSettings.uiScaling = uiScaling;
            this.updateSettings(true, false);
        }, 'setUIScaling', ...arguments);
    }

    // Settings: General Page
    changeAutoUpdateFileChanges(autoUpdateFileChanges: EAutoUpdateFileChanges) {
        errorCatch((autoUpdateFileChanges: EAutoUpdateFileChanges) => {
            this.settings.generalSettings.autoUpdateFileChanges = autoUpdateFileChanges;
            this.updateSettings(true, false);
        }, 'changeAutoUpdateFileChanges', ...arguments);
    }

    changeFShortcut(fShortcut: EFShortcut) {
        errorCatch((fShortcut: EFShortcut) => {
            this.settings.generalSettings.fShortcut = fShortcut;
            this.updateSettings(true, false);
        }, 'changeFShortcut', ...arguments);
    }

    toggleAnalytics(sendAnonymousAnalytics: boolean) {
        errorCatch((sendAnonymousAnalytics: boolean) => {
            this.settings.generalSettings.sendAnonymousAnalytics = sendAnonymousAnalytics;
            this.updateSettings(true, false);
        }, 'toggleAnalytics', ...arguments);
    }

    //Settings: About Page
    getSoftwareName(): string {
        return errorCatch((): string => {
            return getText('app_info_name');
        }, 'getSoftwareName', ...arguments);
    }

    getCopyrightYear(): number {
        return errorCatch((): number => {
            return parseInt(getText('app_info_copyright_year'));
        }, 'getCopyrightYear', ...arguments);
    }

    //update
    toggleAutoUpdate(autoUpdateEnabled: boolean) {
        errorCatch((autoUpdateEnabled: boolean) => {
            this.settings.aboutSettings.autoUpdateEnabled = autoUpdateEnabled;
            this.updateSettings(true, false);
        }, 'toggleAutoUpdate', ...arguments);
    }

    getInstalledVersion(): string {
        return errorCatch((): string => {
            return this.settings.aboutSettings.installedVersion;
        }, 'getInstalledVersion', ...arguments);
    }

    getLatestAvailableVersion(): string {
        return errorCatch((): string => {
            return this.settings.aboutSettings.latestVersion;
        }, 'getLatestAvailableVersion', ...arguments);
    }

    async checkForUpdate(giveNetworkError: boolean = false): Promise<void> {
        return await errorCatchAsync(async (): Promise<void> => {
            if (this.downloadUpdateState == EDownloadUpdateState.Checking)
                return;
            this.downloadUpdateState = EDownloadUpdateState.Checking;
            this.updateSettings(false);
            await delay(1000);

            //This is for demonstrating network error
            if ((this.openCount % 6 == 0) || (giveNetworkError)) {
                this.downloadUpdateState = EDownloadUpdateState.NetworkError;
                this.settings.updateData.storageLocation = undefined;
                this.settings.updateData.downloadProgress = undefined;
                this.openCount = this.openCount + 2;
                saveToLocalStorage('openCount', this.openCount);
                this.updateSettings(false);
                await delay(1000);
            }
            //This is normal update's download
            else {
                this.downloadUpdateState = EDownloadUpdateState.None;
                this.settings.updateData.lastCheckTimestamp = Date.now();
                this.updateSettings(false);

                const isUpdateAvailable: boolean = this.getInstalledVersion() != this.getLatestAvailableVersion();
                if (isUpdateAvailable) {
                    this.settings.updateData.isUpdateAvailable = isUpdateAvailable;
                    this.updateSettings(false);
                    if (isUpdateAvailable && this.getUpdateState() == EUpdateState.UpdateAvailableButNotDownloaded) {
                        if (this.settings.aboutSettings.autoUpdateEnabled)
                            await this.downloadUpdate();
                        else {
                            //If auto update off, then inform UI by message events after update available
                            const updateMessageData: TDialogDetails | null = getMessageDetails(EMessageType.UpdateAutoUpdateOff);
                            if (updateMessageData) {
                                const m: IMessage = {
                                    type: EMessageType.UpdateAutoUpdateOff,
                                    title: updateMessageData.title,
                                    message: updateMessageData.message
                                };
                                this.dispatchEvent(new CustomEvent<IMessage>('message', {detail: m}));
                            }
                        }
                    }
                }

            }

            //Save settings changes to storage
            saveToLocalStorage('settings', this.settings);
        }, 'checkForUpdate', ...arguments);
    }

    async downloadUpdate(installAfterDownload: boolean = false): Promise<void> {
        return await errorCatchAsync(async (): Promise<void> => {
            if (this.downloadUpdateState == EDownloadUpdateState.Downloading)
                return;

            const totalSize = 100; // Total size in MB
            const stepSize = 5; // Increment size in MB
            let downloaded: number = 0;

            this.downloadUpdateState = EDownloadUpdateState.Downloading;
            this.settings.updateData.storageLocation = undefined;
            this.settings.updateData.downloadProgress = 0;
            this.updateSettings(false);

            while (downloaded < totalSize) {
                await delay(150);
                downloaded += stepSize;
                this.settings.updateData.downloadProgress = Math.min(Math.floor((downloaded / totalSize) * 100), 100);
                this.updateSettings(false);
            }

            // After download completion
            this.downloadUpdateState = EDownloadUpdateState.None;
            this.settings.updateData.storageLocation = '/mock/path/to/downloaded/file';
            this.settings.updateData.downloadProgress = 100;
            this.updateSettings(false);

            if (installAfterDownload)
                await this.installUpdate();

            //If auto update on, then if preference is not open needs to be informed in UI using message dialogs
            if (this.settings.aboutSettings.autoUpdateEnabled) {
                const updateMessageData: TDialogDetails | null = getMessageDetails(EMessageType.UpdateAutoUpdateOn);
                if (updateMessageData) {
                    const m: IMessage = {
                        type: EMessageType.UpdateAutoUpdateOn,
                        title: updateMessageData.title,
                        message: updateMessageData.message
                    };
                    this.dispatchEvent(new CustomEvent<IMessage>('message', {detail: m}));
                }
            }

            //Save changed settings to storage
            saveToLocalStorage('settings', this.settings);

        }, 'downloadUpdate', ...arguments);
    }

    // Installs the downloaded update (immediately or on next launch) and mark download installed in the settings
    async installUpdate(): Promise<void> {
        return await errorCatchAsync(async (): Promise<void> => {
            await delay(500);
            this.settings.aboutSettings.installedVersion = this.settings.aboutSettings.latestVersion;
            this.settings.updateData.storageLocation = undefined;
            this.settings.updateData.downloadProgress = undefined;
            this.settings.updateData.isUpdateAvailable = undefined;
            this.settings.updateData.updateInstalled = true;
            this.updateSettings();
        }, 'installUpdate', ...arguments);
    }

    // Skips the currently available update (auto-update off)
    skipUpdate() {
        errorCatch(() => {
            this.settings.updateData.skippedUpdate = true;
            this.settings.updateData.installNextLaunch = false;
            this.settings.updateData.updateInstalled = false;
            this.updateSettings();
        }, 'skipUpdate', ...arguments);
    }

    //Mark downloaded update to be installed on next launch
    installNextLaunch() {
        errorCatch(() => {
            this.settings.updateData.installNextLaunch = true;
            this.settings.updateData.skippedUpdate = false;
            this.settings.updateData.updateInstalled = false;
            this.updateSettings();
        }, 'installNextLaunch', ...arguments);
    }

    isSkippedUpdate(): boolean {
        return errorCatch((): boolean => {
            return <boolean>((this.getUpdateState() === EUpdateState.UpdateAvailableButNotDownloaded) && this.settings.updateData.skippedUpdate);
        }, 'doSkipUpdate', ...arguments);
    }

    // Returns the current state of the update
    getUpdateState(): EUpdateState {
        return errorCatch((): EUpdateState => {
            let result: EUpdateState = EUpdateState.NoUpdate;
            const storageLocation: string | undefined = this.settings.updateData.storageLocation;
            if (this.downloadUpdateState == EDownloadUpdateState.Downloading)
                result = EUpdateState.Downloading;
            else if (this.downloadUpdateState == EDownloadUpdateState.Checking)
                result = EUpdateState.CheckingForUpdate;
            else if (this.downloadUpdateState == EDownloadUpdateState.NetworkError)
                result = EUpdateState.NetworkError;
            else if ((this.getInstalledVersion() != this.getLatestAvailableVersion()) && (storageLocation === undefined))
                result = EUpdateState.UpdateAvailableButNotDownloaded;
            else if (storageLocation !== undefined)
                result = EUpdateState.DownloadedReadyToInstall;
            return result;
        }, 'getUpdateState', ...arguments);
    }
}

const manager: TManager = new TManager();
export default manager;