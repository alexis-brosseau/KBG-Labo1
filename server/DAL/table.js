import fs from 'fs';

export default class Table {

    path = '';
    content = [];

    constructor(path) {
        this.path = path;
        let contentJSON = fs.readFileSync(path);
        this.content = JSON.parse(contentJSON);
    }

    get(id = null) {

        // if no id is given
        if (id == null) {
            return this.content;
        }

        for (let elem of this.content) {
            if (elem.Id == id)
                return elem;
        }

        return null;
    }

    post(data) {
        let maxId = 0;
        for (let elem of this.content) {
            if (elem.Id > maxId)
                maxId = elem.Id;
        }

        data.Id = maxId + 1;
        this.content.push(data);
        fs.writeFileSync(this.path, JSON.stringify(this.content));
    }

    put(data) {

        let storedElem = null;
        for (let elem of this.content) {
            if (elem.Id == data.Id) {
                storedElem = elem;
                break;
            }
        }

        if (storedElem == null) return;
        
        for (let key in data) {
            if (data[key] == null) continue;
            storedElem[key] = data[key];
        }

        fs.writeFileSync(this.path, JSON.stringify(this.content));
    }

    delete(data) {
        for (let i = 0; i < this.content.length; i++) {
            if (this.content[i].Id == data.Id) {
                this.content.splice(i, 1);
                fs.writeFileSync(this.path, JSON.stringify(this.content));
                return;
            }
        }
    }
}