import {IDBPDatabase, openDB} from 'idb';
import {IFile} from './Types';
import {errorCatchAsync} from './Utils';

export class TDatabase {
    private db: IDBPDatabase | null = null;
    private readonly DB_NAME = 'ManagerDatabase';
    private readonly DB_VERSION = 1;

    public async connect(): Promise<void> {
        await errorCatchAsync(async (): Promise<void> => {
            if (!this.db)
                this.db = await openDB(this.DB_NAME, this.DB_VERSION, {
                    upgrade(db) { // Create the files object store if it doesn't exist
                        if (!db.objectStoreNames.contains('files')) {
                            const objectStore = db.createObjectStore('files', {keyPath: 'key'});
                            objectStore.createIndex('updated_at', 'updated_at', {unique: false});
                        }
                    },
                });
        }, 'connect', ...arguments);
    }

    public async addFile(file: IFile): Promise<void> {
        await errorCatchAsync(async (file: IFile): Promise<void> => {
            const tx = this.db!.transaction('files', 'readwrite');
            await tx.objectStore('files').add(file);
            await tx.done;
        }, 'addFile', ...arguments);
    }

    public async addFiles(files: IFile[]): Promise<void> {
        await errorCatchAsync(async (files: IFile[]): Promise<void> => {
            const tx = this.db!.transaction('files', 'readwrite');
            const store = tx.objectStore('files');
            for (const file of files)
                await store.add(file);
            await tx.done;
        }, 'addFiles', ...arguments);
    }

    // Fetch all files by no param, a specific file by key, or the most recent files by count
    public async getFiles(param?: string | number): Promise<IFile[]> {
        return await errorCatchAsync(async (param?: string | number): Promise<IFile[]> => {
            const transaction = this.db!.transaction('files', 'readonly');
            const objectStore = transaction.objectStore('files');
            const index = objectStore.index('updated_at');

            if (typeof param === 'string') { // Fetch a single file by its key
                const file = await objectStore.get(param);
                return file ? [file] : [];
            } else if (typeof param === 'number') { // Fetch the most recent files, sorted by `updated_at`
                const recentFiles: IFile[] = [];
                const cursor = await index.openCursor(null, 'prev'); // Use index to sort by `updated_at`

                let count = 0;
                while (cursor && count < param) {
                    recentFiles.push(cursor.value);
                    count++;
                    await cursor.continue();
                }

                return recentFiles;
            } else
                return await objectStore.getAll(); // Fetch all files if no parameter is provided
        }, 'getFiles', ...arguments);
    }

    public async updateFile(key: string, updatedData: Partial<IFile>): Promise<void> {
        await errorCatchAsync(async (key: string, updatedData: Partial<IFile>): Promise<void> => {
            const tx = this.db!.transaction('files', 'readwrite');
            const store = tx.objectStore('files');
            const existing = await store.get(key);
            if (!existing)
                return;
            const merged = Object.assign(existing, updatedData);
            await store.put(merged);
            await tx.done;
        }, 'updateFile', ...arguments);
    }
}

export const database: TDatabase = new TDatabase();