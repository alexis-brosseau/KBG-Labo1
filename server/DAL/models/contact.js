import Model from '../model.js';

export class Contact extends Model {
    Id = null;
    Name = null;
    Phone = null;
    Email = null;

    constructor(obj = null) {
        super();

        if (obj == null)
            return;
    
        if (!(this.missingKey(obj)))
            this.copy(obj);
    }
}