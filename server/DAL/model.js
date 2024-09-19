export default class Model {
    
    jsonify() {
        let obj = {};
        for (let key in this) {
            obj[key] = this[key];
        }

        return obj;
    }

    stringify() {
        return JSON.stringify(this.jsonify());
    }

    missingKey(obj) {
        for (let key in this)
            if (!(key in obj)) return key;

        return null;
    }

    extraKey(obj) {
        for (let key in obj)
            if (!(key in this)) return key;

        return null;
    }
 
    copy(obj) {
        
        for (let key in this) {
            this[key] = obj[key];
        }
    }

    update(obj) {
        for (let key in obj) {
            this[key] = obj[key];
        }
    }
}