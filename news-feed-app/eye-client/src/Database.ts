export class Database {
    private db?: IDBDatabase;

    initializeDB(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const dbOpenRequest = window.indexedDB.open("states", 1);
            dbOpenRequest.onerror = reject;
            dbOpenRequest.onsuccess = () => {
                this.db = dbOpenRequest.result;
                resolve();
            }

            dbOpenRequest.onupgradeneeded = (event) => {
                this.db = dbOpenRequest.result;
                if (!this.db.objectStoreNames.contains('news')) {
                    this.db!.createObjectStore("news", {keyPath: "key"});
                }

            }
        });
    }

    saveFilterChecked(data: { [index: string]: boolean }) {
        localStorage.setItem("filtersChecked", JSON.stringify(data));
    }

    loadFilterChecked() {
        const loadFilterChecked = localStorage.getItem("filtersChecked");
        if (loadFilterChecked)
            return JSON.parse(loadFilterChecked);
        return {};
    }

    saveNews(data: any[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!this.db) {
                reject("SaveNews DB is not initialize");
                return;
            }

            const transaction = this.db.transaction("news", "readwrite");
            const objectStore = transaction.objectStore("news");

            for (const n of data) {
                objectStore.put(n);
            }

            transaction.commit();
            transaction.oncomplete = () => {
                resolve();
            }
            transaction.onerror = reject;
        });
    }

    loadNews(): Promise<any[]> {
        return new Promise<any[]>((resolve, reject) => {
            if (!this.db) {
                reject("SaveNews DB is not initialize");
                return;
            }

            const transaction = this.db.transaction("news", "readwrite");
            const objectStore = transaction.objectStore("news");
            const data = objectStore.getAll();
            data.onerror =  reject;
            data.onsuccess = () => {
                resolve(data.result);
            }
            transaction.commit();
        });
    }

    isNewsRead(key: string) {
        return new Promise<boolean>((resolve, reject) => {
            if (!this.db) {
                reject("SaveNews DB is not initialize");
                return;
            }

            const transaction = this.db.transaction("news", "readwrite");
            const objectStore = transaction.objectStore("news");
            const request = objectStore.get(key);
            request.onsuccess = (event) => {
                const target = event.target as IDBRequest;
                // resolve(target.result.isRead);
                resolve(target.result);
            }
            request.onerror = reject;
        });
    }

    saveAccordions(accordions: any[]) {
        return new Promise<boolean>((resolve, reject) => {
            if (!this.db) {
                reject("SaveAccordions DB is not initialize");
                return;
            }
            const transaction = this.db.transaction("accordions", "readwrite");
            const objectStore = transaction.objectStore("accordions");
            for (const n of accordions) {
                objectStore.put(n);
            }
            transaction.commit();
            transaction.oncomplete = () => {
                resolve(true);
            }
            transaction.onerror = reject;
        });
    }

    isAccordionsCollapse(id: string) {
        return new Promise<boolean>((resolve, reject) => {
            if (!this.db) {
                reject("SaveAccordions DB is not initialize");
                return;
            }

            const transaction = this.db.transaction("accordions", "readwrite");
            const objectStore = transaction.objectStore("accordions");
            const request = objectStore.get(id);
            request.onsuccess = (event) => {
                const target = event.target as any;
                resolve(target.result.isExpanded);
            }
            request.onerror = reject;
        });
    }
}


export const db = new Database();