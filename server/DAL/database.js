import Table from "./table.js";
export { Contact } from './models/contact.js';
export { Bookmark } from './models/bookmark.js';

export const DB = {
    contacts: new Table('./DAL/data/contacts.json'),
    bookmarks: new Table('./DAL/data/bookmarks.json'),
}