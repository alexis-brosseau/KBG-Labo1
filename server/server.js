// Écrit par Alexis Brosseau
// 16 sept. 24

import { createServer } from 'http';
import { Service, Router, Route } from './service.js';
import { DB, Contact, Bookmark } from './DAL/database.js';

function getPayload(req) {
    return new Promise(resolve => {
        let body = [];
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            if (body.length > 0)
                if (req.headers['content-type'] == "application/json")
                    try { resolve(JSON.parse(body)); }
                    catch (error) { console.log(error); }
            resolve(null);
        });
    })
}

const service = new Service({
    
    // Path: api
    api: new Router({

        // Path: api/contacts
        contacts: new Route({
            GET: async (req, res, arg) => {

                // Check if id is missing (GET all)
                if (arg == null) {
                    res.writeHead(200, { 'content-type': 'application/json' });
                    res.end(JSON.stringify(DB.contacts.get()));
                    return true;
                }

                // Check if id is NaN
                if (isNaN(arg)) {
                    res.writeHead(404);
                    res.end(`Error : ${arg} is not a valid id`);
                    return true;
                }

                let contact = new Contact();
                contact.copy(DB.contacts.get(arg));

                // Check if the contact is missing
                if (contact == null) { 
                    res.writeHead(404);
                    res.end(`Error : The contact of id ${arg} does not exist`);
                    return true;
                }

                res.writeHead(200, { 'content-type': 'application/json' });
                res.end(contact.stringify());
                return true;
            },
            POST: async (req, res, arg) => {

                let data = await getPayload(req);
                let newContact = new Contact(data);

                // Check if data is null
                if (data == null) {
                    res.writeHead(400);
                    res.end(`Error: body is invalid.`);
                    return true;
                }
                
                // Check if data is valid
                let missingKey = newContact.missingKey(data);
                if (missingKey != null && missingKey != 'Id') {
                    res.writeHead(400);
                    res.end(`Error: ${missingKey} is missing`);
                    return true;
                }

                DB.contacts.post(newContact);
                res.writeHead(201, { 'content-type': 'application/json' });
                res.end(newContact.stringify());
                return true;
            },
            PUT: async (req, res, arg) => {
                let data = await getPayload(req);
                let contact = new Contact(data);

                // Check if data is null
                if (data == null) {
                    res.writeHead(400);
                    res.end(`Error: body is invalid.`);
                    return true;
                }

                // Check if data is valid
                let extraKey = contact.extraKey(data);
                if (extraKey != null) {
                    res.writeHead(400);
                    res.end(`Error: ${extraKey} is not a property of contact.`);
                    return true;
                }

                // Check if id is null
                if (arg == null) {
                    res.writeHead(400);
                    res.end(`Error: You must provide an id.`);
                    return true;
                }

                // Check if id is NaN
                if (isNaN(arg)) {
                    res.writeHead(400);
                    res.end(`Error: id must be a number.`);
                    return true;
                }

                // Check if both id are the same
                contact.Id = arg;

                if ('Id' in data) 
                    contact.Id = data.Id;

                if (contact.Id != arg) {
                    res.writeHead(409);
                    res.end(`Error: Conflict of id`);
                    return true;
                }

                // Check is storedContact exist
                let storedContact = DB.contacts.get(contact.id);
                if (storedContact == null) {
                    res.writeHead(404);
                    res.end(`Error: The contact of id ${contact.id} does not exist.`);
                    return true;
                }

                contact.update(data);
                DB.contacts.put(contact);
                res.writeHead(200);
                res.end(contact.stringify());
                return true;
            },
            DELETE: async (req, res, arg) => {

                // Check if id is null
                if (arg == null) {
                    res.writeHead(400);
                    res.end(`Error: You You must provide an id.`);
                    return true;
                }

                // Check if id is NaN
                if (isNaN(arg || NaN)) {
                    res.writeHead(400);
                    res.end(`Error: id must be a number.`);
                    return true;
                }

                let contact = DB.contacts.get(arg);

                // Check if contact exist
                if (contact == null) {
                    res.writeHead(400);
                    res.end(`Error: The contact of id ${arg} does not exist.`);
                    return true;
                }

                contact = new Contact(contact);
                DB.contacts.delete(contact);
                res.writeHead(200);
                res.end(contact.stringify());
                return true;
            }
        }),

        // Path: api/bookmarks
        bookmarks: new Route({
            GET: async (req, res, arg) => {

                // Check if id is missing (GET all)
                if (arg == null) {
                    res.writeHead(200, { 'content-type': 'application/json' });
                    res.end(JSON.stringify(DB.bookmarks.get()));
                    return true
                }

                // Check if id is NaN
                if (isNaN(arg)) {
                    res.writeHead(404);
                    res.end(`Error : ${arg} is not a valid id`);
                    return true;
                }

                let bookmark = DB.bookmarks.get(arg);

                // Check if the bookmark is missing
                if (bookmark == null) { 
                    res.writeHead(404);
                    res.end(`Error : The bookmark of id ${arg} does not exist`);
                    return true;
                }
                
                bookmark = new Bookmark(bookmark);
                res.writeHead(200, { 'content-type': 'application/json' });
                res.end(bookmark.stringify());
                return true;
            },
            POST: async (req, res, arg) => {
                let data = await getPayload(req);
                let newBookmark = new Bookmark(data);

                // Check if data is null
                if (data == null) {
                    res.writeHead(400);
                    res.end(`Error: body is invalid.`);
                    return true;
                }
                
                // Check if data is valid
                let missingKey = newBookmark.missingKey(data);
                if (missingKey != null && missingKey != 'Id') {
                    res.writeHead(400);
                    res.end(`Error: ${missingKey} is missing`);
                    return true;
                }

                DB.bookmarks.post(newBookmark);
                res.writeHead(201, { 'content-type': 'application/json' });
                res.end(newBookmark.stringify());
                return true;
            },
            PUT: async (req, res, arg) => {
                let data = await getPayload(req);
                let bookmark = new Bookmark(data);

                // Check if data is null
                if (data == null) {
                    res.writeHead(400);
                    res.end(`Error: body is invalid.`);
                    return true;
                }

                // Check if data is valid
                let extraKey = bookmark.extraKey(data);
                if (extraKey != null) {
                    res.writeHead(400);
                    res.end(`Error: ${extraKey} is not a property of bookmark.`);
                    return true;
                }

                // Check if id is null
                if (arg == null) {
                    res.writeHead(400);
                    res.end(`Error: You must provide an id.`);
                    return true;
                }

                // Check if id is NaN
                if (isNaN(arg)) {
                    res.writeHead(400);
                    res.end(`Error: id must be a number.`);
                    return true;
                }

                // Check if both id are the same
                bookmark.Id = arg;

                if ('Id' in data) 
                    bookmark.Id = data.Id;

                if (bookmark.Id != arg) {
                    res.writeHead(409);
                    res.end(`Error: Conflict of Id`);
                    return true;
                }

                // Check is storedBookmark exist
                let storedBookmark = DB.bookmarks.get(bookmark.Id);
                if (storedBookmark == null) {
                    res.writeHead(404);
                    res.end(`Error: The bookmark of id ${bookmark.Id} does not exist.`);
                    return true;
                }

                bookmark.update(data);
                DB.bookmarks.put(bookmark);
                res.writeHead(200);
                res.end(bookmark.stringify());
                return true;
            },
            DELETE: async (req, res, arg) => {

                // Check if id is null
                if (arg == null) {
                    res.writeHead(400);
                    res.end(`Error: You You must provide an id.`);
                    return true;
                }

                // Check if id is NaN
                if (isNaN(arg || NaN)) {
                    res.writeHead(400);
                    res.end(`Error: id must be a number.`);
                    return true;
                }

                let bookmark = DB.bookmarks.get(arg);

                // Check if contact exist
                if (bookmark == null) {
                    res.writeHead(400);
                    res.end(`Error: The contact of id ${arg} does not exist.`);
                    return true;
                }

                bookmark = new Bookmark(bookmark);
                DB.bookmarks.delete(bookmark);
                res.writeHead(200);
                res.end(bookmark.stringify());
                return true;
            }
        }),
    }),
});

service.acesses = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Expose-Headers': '*',
};

const server = createServer(async (req, res) => {
    console.log(req.method, req.url);
    
    if (await service.respond(req, res)) return;

    res.writeHead(404);
    res.end();
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));