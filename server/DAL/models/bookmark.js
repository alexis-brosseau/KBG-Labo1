import Model from '../model.js';

export class Bookmark extends Model {
    Id = null;
    Title = null;
    Url = null;
    Category = null;

    constructor(obj = null) {
        super();

        if (obj == null)
            return;
    
        if (!(this.missingKey(obj)))
            this.copy(obj);
    }
}