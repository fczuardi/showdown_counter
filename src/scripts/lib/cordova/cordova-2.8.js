(function(){
/*
 *  Copyright 2011 Wolfgang Koller - http://www.gofg.at/
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

window.Cordova = {
    plugins: {},
    constructors: {},
    callbacks: {},
};

Cordova.callback = function() {
    var scId = arguments[0];
    var callbackRef = null;

    var parameters = [];
    for (var i = 1; i < arguments.length; i++) {
        parameters[i-1] = arguments[i];
    }
    callbackRef = Cordova.callbacks[scId];

    // Even IDs are success-, odd are error-callbacks - make sure we remove both
    if ((scId % 2) !== 0) {
        scId = scId - 1;
    }
    // Remove both the success as well as the error callback from the stack
    delete Cordova.callbacks[scId];
    delete Cordova.callbacks[scId + 1];

    if (typeof callbackRef == "function") callbackRef.apply(this, parameters);
};

Cordova.callbackWithoutRemove = function() {
    var scId = arguments[0];
    var callbackRef = null;

    var parameters = [];
    for (var i = 1; i < arguments.length; i++) {
        parameters[i-1] = arguments[i];
    }
    callbackRef = Cordova.callbacks[scId];

    if (typeof(callbackRef) == "function") callbackRef.apply(this, parameters);
};

Cordova.enablePlugin = function (pluginName) {
    Cordova.plugins[pluginName] = true;

    if (typeof Cordova.constructors[pluginName] === "function") Cordova.constructors[pluginName]();
}

Cordova.addConstructor = function(pluginName, constructor) {
    Cordova.constructors[pluginName] = constructor;
}

Cordova.Event = function() {
};

Cordova.Event.CAPTURING_PHASE = 1;
Cordova.Event.AT_TARGET = 2;
Cordova.Event.BUBBLING_PHASE = 3;

Cordova.Event.prototype.type = "unknown";
Cordova.Event.prototype.target = Cordova;
Cordova.Event.prototype.currentTarget = Cordova;
Cordova.Event.prototype.eventPhase = Cordova.Event.AT_TARGET;
Cordova.Event.prototype.bubbles = false;
Cordova.Event.prototype.cancelable = false;
Cordova.Event.prototype.timeStamp = 0;

Cordova.Event.prototype.stopPropagation = function() {};
Cordova.Event.prototype.preventDefault = function() {};
Cordova.Event.prototype.initEvent = function (eventTypeArg, canBubbleArg, cancelableArg) {
    this.type = eventTypeArg;
    this.timeStamp = (new Date()).getMilliseconds();
};

Cordova.EventHandler = function(p_type) {
    this.type = p_type
    this.listeners = []
}

Cordova.EventHandler.prototype.type = "unknown";
Cordova.EventHandler.prototype.listeners = [];
Cordova.EventHandler.prototype.addEventListener = function(p_listener, p_capture) {
    if (p_capture) {
        this.listeners.unshift(p_listener);
    }
    else {
        this.listeners.push(p_listener);
    }
};

Cordova.EventHandler.prototype.removeEventListener = function(p_listener, p_capture) {
    for (var i = 0; i < this.listeners.length; i++) {
        if (this.listeners[i] === p_listener) {
            this.listeners.splice(i, 1);
            break;
        }
    }
};

Cordova.EventHandler.prototype.dispatchEvent = function() {
    var event = new Cordova.Event();
    event.initEvent(this.type, false, false);

    for (var i = 0; i < this.listeners.length; i++) {
        this.listeners[i].apply(Cordova, arguments);
    }
};

Cordova.events = {
    deviceready: new Cordova.EventHandler("deviceready"),
    resume: new Cordova.EventHandler("resume"),
    pause: new Cordova.EventHandler("pause"),
    online: new Cordova.EventHandler("online"),
    offline: new Cordova.EventHandler("offline"),
    backbutton: new Cordova.EventHandler("backbutton"),
    batterycritical: new Cordova.EventHandler("batterycritical"),
    batterylow: new Cordova.EventHandler("batterylow"),
    batterystatus: new Cordova.EventHandler("batterystatus"),
    menubutton: new Cordova.EventHandler("menubutton"),
    searchbutton: new Cordova.EventHandler("searchbutton"),
    startcallbutton: new Cordova.EventHandler("startcallbutton"),
    endcallbutton: new Cordova.EventHandler("endcallbutton"),
    volumedownbutton: new Cordova.EventHandler("volumedownbutton"),
    volumeupbutton: new Cordova.EventHandler("volumeupbutton")
};

//Keep references to the original EventTarget implementations
Cordova.doc_addEventListener = document.addEventListener;
Cordova.doc_removeEventListener = document.removeEventListener;
Cordova.doc_dispatchEvent = document.dispatchEvent;

document.addEventListener = function(type, listener, useCapture) {
    if (typeof Cordova.events[type] !== "undefined") {
        Cordova.events[type].addEventListener(listener, useCapture);
    } else {
        Cordova.doc_addEventListener.call(document, type, listener, useCapture);
    }
};

document.removeEventListener = function(type, listener, useCapture) {
    if (typeof Cordova.events[type] !== "undefined") {
        Cordova.events[type].removeEventListener(listener, useCapture);
    } else {
        Cordova.doc_removeEventListener.call(document, type, listener, useCapture);
    }
};

document.dispatchEvent = function (evt) {
    if (typeof Cordova.events[evt.type] !== "undefined") {
        Cordova.events[evt.type].dispatchEvent();
    } else {
        Cordova.doc_dispatchEvent.call(document, evt);
    }
};

var deviceReadyCounter = 0;
var isDeviceReady = false;
Cordova.deviceready = function() {
    isDeviceReady = true;
    if (!deviceReadyCounter) {
        Cordova.events.deviceready.dispatchEvent();
    }
}
Cordova.deviceready.freeze = function() {
    if (isDeviceReady && !deviceReadyCounter) {
        console.log('WARNING: trying freeze deviceready event after it was emited');
    }
    deviceReadyCounter++;
}
Cordova.deviceready.unfreeze = function() {
    deviceReadyCounter--;
    if (!deviceReadyCounter && isDeviceReady) {
        Cordova.deviceready();
    }
}


Cordova.resumeOccured = function() {
    Cordova.events.resume.dispatchEvent();
}
Cordova.pauseOccured = function() {
    Cordova.events.pause.dispatchEvent();
}
Cordova.onlineOccured = function() {
    Cordova.events.online.dispatchEvent();
}
Cordova.offlineOccured = function() {
    Cordova.events.offline.dispatchEvent();
}

navigator.battery = {
    _level: null,
    _isPlugged: null
};

Cordova.batteryStatusChanged = function(level, isPlugged, forceStatus) {
    if (navigator.battery._level === level && navigator.battery._isPlugged === isPlugged)
        return;

    console.log("Cordova.batteryStatusChanged: " + level + ", " + isPlugged + ", " + forceStatus)
    if (level < 3 && !forceStatus)
        Cordova.events.batterycritical.dispatchEvent({level: level, isPlugged: isPlugged})
    else if (level < 40 && !forceStatus)
        Cordova.events.batterylow.dispatchEvent({level: level, isPlugged: isPlugged})
    Cordova.events.batterystatus.dispatchEvent({level: level, isPlugged: isPlugged})

    navigator.battery._level = level;
    navigator.battery._isPlugged = isPlugged;
}

Cordova.menuKeyPressed = function() {
    Cordova.events.menubutton.dispatchEvent();
}
Cordova.backKeyPressed = function() {
    Cordova.events.backbutton.dispatchEvent();
}
Cordova.searchKeyPressed = function() {
    Cordova.events.searchbutton.dispatchEvent();
}
Cordova.callKeyPressed = function() {
    Cordova.events.startcallbutton.dispatchEvent();
}
Cordova.hangupKeyPressed = function() {
    Cordova.events.endcallbutton.dispatchEvent();
}
Cordova.volumeUpKeyPressed = function() {
    Cordova.events.volumeupbutton.dispatchEvent();
}
Cordova.volumeDownKeyPressed = function() {
    Cordova.events.volumedownbutton.dispatchEvent();
}
/*
 *  Copyright 2011 Wolfgang Koller - http://www.gofg.at/
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

Cordova.Qt = {};

var callbackId = 1;

/**
 * Execute a call to a plugin function
 * @return bool true on success, false on error (e.g. function doesn't exist)
 */
Cordova.Qt.exec = function(successCallback, errorCallback, pluginName, functionName, parameters) {
    // Check if plugin is enabled
    if (Cordova.plugins[pluginName] !== true) {
        return false;
    }

    if (callbackId % 2) {
        callbackId++;
    }

    // Store a reference to the callback functions
    var scId = callbackId++;
    var ecId = callbackId++;
    Cordova.callbacks[scId] = successCallback;
    Cordova.callbacks[ecId] = errorCallback;

    parameters.unshift(ecId);
    parameters.unshift(scId);

    navigator.qt.postMessage(JSON.stringify({messageType: "callPluginFunction", plugin: pluginName, func: functionName, params: parameters}))
    return true;
}

Cordova.Qt.objects = {};
Cordova.Qt.registerObject = function(pluginName, pluginObject) {
    Cordova.Qt.objects[pluginName] = pluginObject;
}

Cordova.exec = Cordova.Qt.exec;

/*
 *  Copyright 2011 Wolfgang Koller - http://www.gofg.at/
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

function Console() {
}

Console.prototype.log = function(p_message) {
    Cordova.exec(null, null, "com.cordova.Console", "log", [p_message]);
}

Cordova.addConstructor("com.cordova.Console", function() {
    window.console = new Console();
});
/*
 *  Copyright 2011 Wolfgang Koller - http://www.gofg.at/
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

function Connection() {
    var self = this;
    self.type = Connection.UNKNOWN;

    var first = true;
    Cordova.deviceready.freeze();

    Cordova.exec(function (res) {
        self.type = res;
        if (first) {
            Cordova.deviceready.unfreeze();
            first = false;
        }
    }, null, "com.cordova.Connection", "getType", []);
}

Connection.UNKNOWN = "unknown";
Connection.ETHERNET = "ethernet";
Connection.WIFI = "wifi";
Connection.CELL_2G = "2g";
Connection.CELL_3G = "3g";
Connection.CELL_4G = "4g";
Connection.NONE = "none";
Connection.CELL = "cellular";

Cordova.addConstructor("com.cordova.Connection", function() {
    if (typeof(navigator.network) === "undefined") navigator.network = {};

    navigator.network.connection = new Connection();
    navigator.connection = navigator.network.connection;
    window.Connection = Connection;
});
/*
 *  Copyright 2011 Wolfgang Koller - http://www.gofg.at/
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

function Device() {
    var self = this;
    Cordova.deviceready.freeze();

    Cordova.exec(function (p_name, p_cordova, p_platform, p_uuid, p_version) {
        self.name = p_name;
        self.model = p_name;
        self.cordova = p_cordova;
        self.platform = p_platform;
        self.uuid = p_uuid;
        self.version = p_version;

        Cordova.deviceready.unfreeze();
    }, null, "com.cordova.Device", "getInfo", []);
};

Device.prototype.name = "";
Device.prototype.cordova = "";
Device.prototype.platform = "";
Device.prototype.uuid = "";
Device.prototype.version = "";

Cordova.addConstructor("com.cordova.Device", function() {
    window.device = new Device();
    window.cordova = window.Cordova;
/*    var PhoneGap = window.Cordova;
    PhoneGap.addPlugin = window.Cordova.enablePlugin;
    var plugins = window.Cordova;
*/
});

/*
 *  Copyright 2011 Wolfgang Koller - http://www.gofg.at/
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

function FileError() {
}

FileError.cast = function(p_code) {
    var fe = new FileError();
    fe.code = p_code;

    return fe;
}
FileError.prototype.code = 0;
FileError.NOT_FOUND_ERR = 1;
FileError.SECURITY_ERR = 2;
FileError.ABORT_ERR = 3;
FileError.NOT_READABLE_ERR = 4;
FileError.ENCODING_ERR = 5;
FileError.NO_MODIFICATION_ALLOWED_ERR = 6;
FileError.INVALID_STATE_ERR = 7;
FileError.SYNTAX_ERR = 8;
FileError.INVALID_MODIFICATION_ERR = 9;
FileError.QUOTA_EXCEEDED_ERR = 10;
FileError.TYPE_MISMATCH_ERR = 11;
FileError.PATH_EXISTS_ERR = 12;

function FileException() {
}

FileException.cast = function(p_code) {
    var fe = new FileException();
    fe.code = p_code;

    return fe;
}
FileException.prototype.code = 0;
FileException.NOT_FOUND_ERR = 1;
FileException.SECURITY_ERR = 2;
FileException.ABORT_ERR = 3;
FileException.NOT_READABLE_ERR = 4;
FileException.ENCODING_ERR = 5;
FileException.NO_MODIFICATION_ALLOWED_ERR = 6;
FileException.INVALID_STATE_ERR = 7;
FileException.SYNTAX_ERR = 8;
FileException.INVALID_MODIFICATION_ERR = 9;
FileException.QUOTA_EXCEEDED_ERR = 10;
FileException.TYPE_MISMATCH_ERR = 11;
FileException.PATH_EXISTS_ERR = 12;


function Metadata(p_modificationDate) {
    this.modificationTime = p_modificationDate || null;
    return this;
}

Metadata.cast = function(p_modificationDate) {
    var md = new Metadata(p_modificationDate);
    return md;
}

function Flags(create, exclusive) {
    this.create = create || false;
    this.exclusive = exclusive || false;
};

Flags.cast = function(p_modificationDate) {
    var md = new Metadata(p_modificationDate);
    return md;
}
Flags.cast = function(create, exclusive) {
    var that = new Flags(create, exclusive);
    return that;
};

function Entry() {
}
Entry.prototype.isFile = false;
Entry.prototype.isDirectory = false;
Entry.prototype.name = "";
Entry.prototype.fullPath = "";//fullpath for cordova-test = realFullPath - "/"
Entry.prototype.filesystem = null;
Entry.prototype.getMetadata = function(successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "com.cordova.File", "getMetadata", [this.fullPath]);
}
Entry.prototype.setMetadata = function(successCallback, errorCallback) {
    //TODO: implement
    //Cordova.exec(successCallback, errorCallback, "com.cordova.File", "setMetadata", [this.fullPath]);
}

Entry.prototype.toURL = function(mimeType) {
    return "file://" + this.fullPath;
}
Entry.prototype.remove = function(successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "com.cordova.File", "remove", [this.fullPath]);
}
Entry.prototype.getParent = function(successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "com.cordova.File", "getParent", [this.fullPath]);
}

function File(name, fullPath, type, lastModifiedDate, size) {
    this.name = name || null;
    this.fullPath = fullPath || null;
    this.type = type || null;
    this.lastModifiedDate = lastModifiedDate || null;
    this.size = size || 0;
}

File.cast = function(p_name, p_fullPath, p_type, p_lastModifiedDate, p_size) {
    var f = new File(p_name, p_fullPath, p_type, p_lastModifiedDate, p_size);
    return f;
}

File.prototype.slice = function(start, end) {
    var res = new File(this.name, this.fullPath, this.type, this.lastModifiedDate, this.size);
    res._sliceStart = start;
    res._sliceEnd = end;
    return res;
}

function FileSaver() {
}

FileSaver.createEvent = function(p_type, p_target) {
    var evt = {
        "type": p_type,
        "target": p_target
    };

    return evt;
}

FileSaver.prototype.abort = function() {
    if (this.readyState == FileSaver.INIT || this.readyState == FileSaver.DONE) throw FileException.cast(FileException.INVALID_STATE_ERR);

    this.error = FileError.cast(FileError.ABORT_ERR);
    this.readyState = FileSaver.DONE;

    if (typeof this.onerror === "function") this.onerror(FileSaver.createEvent("error", this));
    if (typeof this.onabort === "function") this.onabort(FileSaver.createEvent("abort", this));
    if (typeof this.onwriteend === "function") this.onwriteend(FileSaver.createEvent("writeend", this));
}

FileSaver.INIT = 0;
FileSaver.WRITING = 1;
FileSaver.DONE = 2;

FileSaver.prototype.readyState = FileSaver.INIT;
FileSaver.prototype.error = new FileError();
FileSaver.prototype.onwritestart = null;
FileSaver.prototype.onprogress = null;
FileSaver.prototype.onwrite = null;
FileSaver.prototype.onabort = null;
FileSaver.prototype.onerror = null;
FileSaver.prototype.onwriteend = null;

function FileWriter(p_file) {
    this.fullPath = p_file.fullPath || "";
    return this;
}

FileWriter.cast = function(p_fullPath, p_length) {
    var tmpFile = new File(null,p_fullPath,null, null,null);
    var fw = new FileWriter(tmpFile);

    return fw;
}

FileWriter.prototype = new FileSaver();
FileWriter.prototype.fullPath = "";
FileWriter.prototype.position = 0;
FileWriter.prototype.length = 0;
FileWriter.prototype._write = function(data, isBinary) {
    // Check if we are able to write
    if (this.readyState === FileSaver.WRITING) throw FileException.cast(FileException.INVALID_STATE_ERR);

    this.readyState = FileSaver.WRITING;
    if (typeof this.onwritestart === "function") this.onwritestart(FileSaver.createEvent("writestart", this));

    var me = this;
    Cordova.exec(function(p_position, p_length) {
        me.position = p_position;
        me.length = p_length;

        me.readyState = FileSaver.DONE;

        if (typeof me.onwrite === "function") me.onwrite(FileSaver.createEvent("write", me));
        if (typeof me.onwriteend === "function") me.onwriteend(FileSaver.createEvent("writeend", me));
    }, function(p_fileError, p_position, p_length) {
        me.position = p_position;
        me.length = p_length;

        me.error = p_fileError;
        me.readyState = FileSaver.DONE;

        if (typeof me.onerror === "function") me.onerror(FileWriter.createEvent("error", me));
        if (typeof me.onwriteend === "function") me.onwriteend(FileWriter.createEvent("writeend", me));
    }, "com.cordova.File", "write", [this.fullPath, this.position, data, isBinary]);
}

FileWriter.prototype.write = function(data) {
    if (data instanceof ArrayBuffer) {
    var binary = "";
    for (var i = 0; i < data.byteLength; i++) {
            binary += String.fromCharCode(data[i]);
    }
        this._write(binary, true);
    } else if ((data instanceof Blob) || (data instanceof File)) {
        var self = this;
        var reader = new FileReader();
        reader.onloadend = function(evt) {
            //FIXME: check for error;
            self._write(evt.target.result, true);
        }
        reader.readAsBinaryString(data);
    } else {
        this._write(data, false);
    }
}

FileWriter.prototype.seek = function(offset) {
    if (this.readyState === FileSaver.WRITING) throw FileException.cast(FileException.INVALID_STATE_ERR);

    if (offset < 0) {
        this.position = Math.max(offset + this.length, 0);
    }
    else if (offset > this.length) {
        this.position = this.length;
    }
    else {
        this.position = offset;
    }
}

FileWriter.prototype.truncate = function(size) {
    // Check if we are able to write
    if (this.readyState == FileSaver.WRITING) throw FileException.cast(FileException.INVALID_STATE_ERR);

    this.readyState = FileSaver.WRITING;
    if (typeof this.onwritestart === "function") this.onwritestart(FileSaver.createEvent("writestart", this));

    var me = this;
    Cordova.exec(function(p_position, p_length) {
        me.position = p_position;
        me.length = p_length;

        me.readyState = FileSaver.DONE;

        if (typeof me.onwrite === "function") me.onwrite(FileSaver.createEvent("write", me));
        if (typeof me.onwriteend === "function") me.onwriteend(FileSaver.createEvent("writeend", me));
    }, function(p_fileError, p_position, p_length) {
        me.position = p_position;
        me.length = p_length;

        me.error = p_fileError;
        me.readyState = FileSaver.DONE;

        if (typeof me.onerror === "function") me.onerror(FileSaver.createEvent("error", me));
        if (typeof me.onwriteend === "function") me.onwriteend(FileSaver.createEvent("writeend", me));
    }, "com.cordova.File", "truncate", [this.fullPath, size]);
}

var originFileReader = window.FileReader;
function forwardRequestToOriginalFileReader(source, methodName, file) {
    var of = new originFileReader();
    for (var i in source) {
        if (source.hasOwnProperty(i))
            of[i] = source[i];
    }
    of[methodName](file);
}

function FileReader() {
}

FileReader.EMPTY = 0;
FileReader.LOADING = 1;
FileReader.DONE = 2;

FileReader.prototype.readyState = FileReader.EMPTY;
FileReader.prototype.result = "";
FileReader.prototype.error = new FileError();
FileReader.prototype.onloadstart = null;
FileReader.prototype.onprogress = null;
FileReader.prototype.onload = null;
FileReader.prototype.onabort = null;
FileReader.prototype.onerror = null;
FileReader.prototype.onloadend = null;

FileReader.prototype.readAsArrayBuffer = function(file) {
    if (file instanceof Blob) {
        forwardRequestToOriginalFileReader(this, 'readAsArrayBuffer', file);
        return;
    }
    function strToArray(str) {
        var res = new Uint8Array(str.length);
        for (var i = 0; i < str.length; i++) {
            res[i] = str.charCodeAt(i);
        }
        return res;
    }

    var origLoadEnd = this.onloadend;
    var origError = this.onerror;
    var self = this;
    function restore() {
        self.onerror = origError;
        self.onloadend = origLoadEnd;
    }
    this.onloadend = function() {
        restore();
        self.result = strToArray(self.result);
        origLoadEnd.apply(this, arguments);
    }
    this.onerror = function() {
        restore();
        origError.apply(this, arguments);
    }
    this.readAsText(file);
};

function createReaderFunc(name) {
    return function(file) {
        if (file instanceof Blob) {
            forwardRequestToOriginalFileReader(this, name, file);
            return;
        }
        this.readyState = FileReader.EMPTY;
        this.result = null;

        this.readyState = FileReader.LOADING;

        if (typeof this.onloadstart === "function") this.onloadstart(FileSaver.createEvent("loadstart", this));

        var me = this;
        var sliceStart = 0, sliceEnd = -1/*-1 is undefined*/, sliced = false;
        if (file._sliceStart !== undefined) {
            sliceStart = file._sliceStart;
            if (file._sliceEnd !== undefined) {
                sliceEnd = file._sliceEnd;
                if (sliceEnd < 0)
                    sliceEnd--;
            }
            sliced = true;
        }
        Cordova.exec(function(p_data) {
            me.readyState = FileReader.DONE;
            me.result = p_data;

            if (typeof me.onload === "function") me.onload(FileSaver.createEvent("load", me));
            if (typeof me.onloadend === "function") me.onloadend(FileSaver.createEvent("loadend", me));
        }, function(p_fileError) {
            me.readyState = FileReader.DONE;
            me.result = null;
            me.error = p_fileError;

            if (typeof me.onloadend === "function") me.onloadend(FileSaver.createEvent("loadend", me));
            if (typeof me.onerror === "function") me.onerror(FileSaver.createEvent("error", me));
        }, "com.cordova.File", name, [file.fullPath, sliced, sliceStart, sliceEnd]);
    };
}

FileReader.prototype.readAsBinaryString = createReaderFunc('readAsBinaryString');
FileReader.prototype.readAsText = createReaderFunc('readAsText');
FileReader.prototype.readAsDataURL = createReaderFunc('readAsDataURL');

FileReader.prototype.abort = function() {
    this.readyState = FileReader.DONE;
    this.result = null;
    this.error = FileError.cast(FileError.ABORT_ERR);

    if (typeof this.onerror === "function") this.onerror(FileSaver.createEvent("error", me)) ;
    if (typeof this.onabort === "function") this.onabort(FileSaver.createEvent("abort", me)) ;
    if (typeof this.onloadend === "function") this.onloadend(FileSaver.createEvent("loadend", me)) ;
}


function FileEntry() {
    this.isFile = true;
    this.isDirectory = false;
}

FileEntry.cast = function(filename, path) {
    var fe = new FileEntry();
    fe.name = filename;
    fe.fullPath = path;

    return fe;
}

FileEntry.prototype = new Entry();
FileEntry.prototype.createWriter = function(successCallback, errorCallback) {
    this.file(function(p_file) {
        successCallback(FileWriter.cast(p_file.fullPath, p_file.size));
    }, errorCallback);
}
FileEntry.prototype.file = function(successCallback, errorCallback) {
    // Lets get the fileinfo
    Cordova.exec(successCallback, errorCallback, "com.cordova.File", "file", [this.fullPath]);
}
FileEntry.prototype.copyTo = function(parent, newName, successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "com.cordova.File", "copyFile", [this.fullPath, parent.fullPath, newName]);
};

FileEntry.prototype.moveTo = function(parent, newName, successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "com.cordova.File", "moveFile", [this.fullPath, parent.fullPath, newName]);
};

function DirectoryReader() {
}

DirectoryReader.cast = function(p_fullPath) {
    var dr = new DirectoryReader();
    dr.fullPath = p_fullPath;

    return dr;
}

DirectoryReader.prototype.fullPath = "";
DirectoryReader.prototype.readEntries = function(successCallback, errorCallback) {
    if (this._used) {
        try {
            successCallback([]);
        } catch (e) {}
        return;
    }
    this._used = true;
    Cordova.exec(successCallback, errorCallback, "com.cordova.File", "readEntries", [this.fullPath]);
}

function DirectoryEntry() {
    this.isFile = false;
    this.isDirectory = true;
}

DirectoryEntry.cast = function(dirname, path) {
    var de = new DirectoryEntry();
    de.name = dirname;
    de.fullPath = path;
    return de;
}

DirectoryEntry.prototype = new Entry();
DirectoryEntry.prototype.createReader = function() {
    return DirectoryReader.cast(this.fullPath);
}
DirectoryEntry.prototype.getFile = function(path, options, successCallback, errorCallback) {
    var requestPath = path;

    if (requestPath.charAt(0) !== '/') requestPath = this.fullPath + "/" + requestPath;

    Cordova.exec(successCallback, errorCallback, "com.cordova.File", "getFile", [requestPath, options]);
}
DirectoryEntry.prototype.getDirectory = function(path, options, successCallback, errorCallback) {
    var requestPath = path;

    // Check for a relative path
    if (requestPath.charAt(0) != '/') requestPath = this.fullPath + "/" + requestPath;

    Cordova.exec(successCallback, errorCallback, "com.cordova.File", "getDirectory", [requestPath, options]);
}
DirectoryEntry.prototype.removeRecursively = function(successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "com.cordova.File", "removeRecursively", [this.fullPath]);
}

DirectoryEntry.prototype.copyTo = function(parent, newName, successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "com.cordova.File", "copyDir", [this.fullPath, parent.fullPath, newName]);
};

DirectoryEntry.prototype.moveTo = function(parent, newName, successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "com.cordova.File", "moveDir", [this.fullPath, parent.fullPath, newName]);
};

function FileSystem() {
}

FileSystem.cast = function(fsname, dirname, path) {
    var fs = new FileSystem();
    fs.name = fsname;
    fs.root = DirectoryEntry.cast(dirname, path);

    return fs;
}

FileSystem.prototype.name = "";
FileSystem.prototype.root = null; // Should be a DirectoryEntry

function LocalFileSystem() {
}

LocalFileSystem.TEMPORARY = 0;
LocalFileSystem.PERSISTENT = 1;

LocalFileSystem.prototype.requestFileSystem = function(type, size, successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "com.cordova.File", "requestFileSystem", [type,size]);
}
LocalFileSystem.prototype.resolveLocalFileSystemURL = function(url, successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "com.cordova.File", "resolveLocalFileSystemURL", [url]);
}

function FileUploadOptions() {
    this.fileKey = "file";
    this.fileName = "image.jpg";
    this.mimeType = "image/jpeg";
    this.params = {};
    this.chunkedMode = true;
    this.headers = {};
}

function FileUploadResult() {
    this.bytesSent = 0;
    this.responseCode = 400;
    this.response = "";
}

function FileTransferError(code, source, target, http_status) {
    this.code = code;
    this.source = source;
    this.target = target;
    this.http_status = http_status;
}

FileTransferError.FILE_NOT_FOUND_ERR = 1;
FileTransferError.INVALID_URL_ERR = 2;
FileTransferError.CONNECTION_ERR = 3;
FileTransferError.ABORT_ERR = 4;

function FileTransfer() {
    //TODO: implement onprogress
    var self = this;

    this._id = 0;
    this._callQueue = [];
    this._aborted = 0;
    this._callNum = 0;
    Cordova.exec(function (id) {
        Cordova.exec(function(loaded, total) {
            if (typeof(self.onprogress) === 'function') {
                self.onprogress({ lengthComputable: total > 0, total: total, loaded: loaded });
            }
        }, null, "com.cordova.File", "transferRequestSetOnProgress", [ id ]);

        self._id = id;
        for (var i = 0; i < self._callQueue.length; i++) {
            self._callQueue[i]();
        }
        delete self._callQueue;
    }, null, "com.cordova.File", "newTransferRequest", [  ]);
}

FileTransfer.prototype = {
    upload: function(filePath, server, successCallback, errorCallback, override, trustAllHosts) {
        var self = this;
        if (this._id === 0) {
            var args = arguments;
            this._callQueue.push(function () {
                self.upload.apply(self, args);
            });
            return;
        }

        var callNum = ++this._callNum;

        if (typeof(successCallback) !== "function") return;
        if (typeof(errorCallback) !== "function") errorCallback = new Function();
        if (typeof(override) !== "object") override = {};

        var options = new FileUploadOptions();
        for (var key in options) {
            if (!(options.hasOwnProperty(key) && override.hasOwnProperty(key)))
                continue;
            if (typeof(options[key]) !== typeof(override[key]))
                continue;
            //TODO: check value limits
            options[key] = override[key];
        }
        for (var key in options.params) {
            if (!options.params.hasOwnProperty(key))
                continue;
            options.params[key] = String(options.params[key]);
        }
        for (var key in options.headers) {
            if (!options.headers.hasOwnProperty(key))
                continue;
            if (options.headers[key] instanceof Array) {
                var array = options.headers[key];
                for (var i = 0; i < array.length; i++) {
                    array[i] = String(array[i]);
                }
                options.headers[key] = array.join(', ');
            } else {
                options.headers[key] = String(options.headers[key]);
            }
        }

        var file = new File(null, filePath);
        var reader = new FileReader();
        reader.onerror = function () {
            errorCallback(new FileTransferError(FileTransferError.FILE_NOT_FOUND_ERR, filePath, server, 0));
        };

        reader.readAsDataURL(file);

        reader.onloadend = function () {
            if (!reader.result)
                return;

            if (self._aborted > callNum) {
                errorCallback(new FileTransferError(FileTransferError.ABORT_ERR, filePath, server, 0));
                return;
            }

            var match = reader.result.match(/^data:[^;]*;base64,(.+)$/);
            if (match) {
                //FIXME: stack overflow with large files
                Cordova.exec(function(status, response) {
                    successCallback({ bytesSent: match[1].length, responseCode: status, response: response });
                }, function (status) {
                    if (status === "abort") {
                        errorCallback(new FileTransferError(FileTransferError.ABORT_ERR, filePath, server, 0));
                    } else if (status === "invalidUrl") {
                        errorCallback(new FileTransferError(FileTransferError.INVALID_URL_ERR, filePath, server, 0));
                    } else {
                        errorCallback(new FileTransferError(FileTransferError.CONNECTION_ERR, filePath, server, status));
                    }
                }, "com.cordova.File", "uploadFile", [self._id, server, atob(match[1]), options["fileKey"], options["fileName"], options["mimeType"], options.params, options.headers]);
            }
        }
    },

    download: function(source, target, successCallback, errorCallback, trustAllHosts) {
        var self = this;
        if (this._id === 0) {
            var args = arguments;
            this._callQueue.push(function () {
                self.download.apply(self, args);
            });
            return;
        }

        if (typeof(successCallback) !== "function") return;
        if (typeof(errorCallback) !== "function") errorCallback = new Function();

        ++this._callNum;

        Cordova.exec(function(data) {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
                fileSystem.root.getFile(target, {create: true, exclusive: false}, function (fileEntry) {
                    fileEntry.createWriter(function (writer) {
                        writer.onwriteend = function () {
                            successCallback(fileEntry);
                        }
                        writer.onerror = errorCallback;

                        writer._write(atob(data), true);
                    }, errorCallback);
                }, function () {
                    errorCallback(new FileTransferError(FileTransferError.FILE_NOT_FOUND_ERR, source, target, 0));
                });
            }, errorCallback);
        }, function (status, body) {
            var error;
            if (status === "abort") {
                error = new FileTransferError(FileTransferError.ABORT_ERR, source, target, 0);
            } else if (status === "invalidUrl") {
                error = new FileTransferError(FileTransferError.INVALID_URL_ERR, source, target, 0);
            } else {
                error = new FileTransferError(FileTransferError.CONNECTION_ERR, source, target, status);
            }
            if (body) {
                error.body = atob(body);
            }

            errorCallback(error);
        }, "com.cordova.File", "downloadFile", [this._id, source]);
    },

    abort: function() {
        if (this._id === 0) {
            var args = arguments;
            var self = this;
            this._callQueue.push(function () {
                self.abort.apply(self, args);
            });
            return;
        }

        this._aborted = ++this._callNum;
        Cordova.exec(null, null, "com.cordova.File", "abortRequests", [this._id]);
    }
};

Cordova.addConstructor("com.cordova.File", function () {
    var localFileSystem = new LocalFileSystem();
    window.requestFileSystem = localFileSystem.requestFileSystem;
    window.resolveLocalFileSystemURI = localFileSystem.resolveLocalFileSystemURL;

    window.FileUploadOptions = FileUploadOptions;
    window.FileTransfer = FileTransfer;
    window.FileTransferError = FileTransferError;
    window.FileError = FileError;
    window.FileReader = FileReader;
    window.FileWriter = FileWriter;
    window.File = File;
    window.LocalFileSystem = LocalFileSystem;
    window.FileEntry = FileEntry;
    window.DirectoryEntry = DirectoryEntry;
    window.DirectoryReader = DirectoryReader;
    window.FileSystem = FileSystem;
    window.FileEntry = FileEntry;
    window.Flags = Flags;
    window.Metadata = Metadata;
    window.FileException = FileException;
});
/*
 *  Copyright 2011 Wolfgang Koller - http://www.gofg.at/
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

function Coordinates() {
};

Coordinates.cast = function (p_latitude, p_longitude, p_altitude, p_accuracy, p_altitudeAccuracy, p_heading, p_speed) {
    var coordinates = new Coordinates();

    coordinates.latitude = p_latitude;
    coordinates.longitude = p_longitude;
    coordinates.altitude = p_altitude;
    coordinates.accuracy = p_accuracy;
    coordinates.altitudeAccuracy = p_altitudeAccuracy;
    coordinates.heading = p_heading;
    coordinates.speed = p_speed;

    return coordinates;
};

Coordinates.prototype.latitude = 0;
Coordinates.prototype.longitude = 0;
Coordinates.prototype.altitude = 0;
Coordinates.prototype.accuracy = 0;
Coordinates.prototype.altitudeAccuracy = 0;
Coordinates.prototype.heading = 0;
Coordinates.prototype.speed = 0;

function Position() {
};

Position.cast = function (p_coords, p_timestamp) {
    // The timestamp is optional and can be auto-generated on creation
    if (typeof p_timestamp === "undefined") p_timestamp = (new Date()).getMilliseconds();

    var position = new Position();

    position.coords = p_coords;
    position.timestamp = p_timestamp;

    return position;
};

Position.prototype.coords = null;
Position.prototype.timestamp = 0;

function PositionError() {
};

PositionError.cast = function(p_code, p_message) {
    var positionError = new PositionError();
    positionError.code = p_code;
    positionError.message = p_message;

    return positionError;
};

PositionError.PERMISSION_DENIED = 1;
PositionError.POSITION_UNAVAILABLE = 2;
PositionError.TIMEOUT = 3;

PositionError.prototype.code = 0;
PositionError.prototype.message = "";

function PositionOptions() {
};

PositionOptions.prototype.enableHighAccuracy = false;
PositionOptions.prototype.timeout = -1;  // Timeout by default negative, which means no timeout
PositionOptions.prototype.maximumAge = 0;

function Geolocation() {
};

Geolocation.prototype.watchIds = [];
Geolocation.prototype.cachedPosition = null;

Geolocation.prototype.getCurrentPosition = function (successCallback, errorCallback, options) {
    // Check the callbacks
    if (typeof successCallback !== "function") return;
    if (typeof errorCallback !== "function") errorCallback = function() {};

    // This is a workaround as we allow passing any object in as options (for convenience)
    var positionOptions = new PositionOptions();
    if (typeof options.maximumAge !== "undefined" && options.maximumAge > 0) positionOptions.maximumAge = options.maximumAge;
    if (typeof options.timeout !== "undefined") {
        if (options.timeout > 0) {
            positionOptions.timeout = options.timeout;
        } else {
            positionOptions.timeout = 0;
        }
    }
    if (typeof options.enableHighAccuracy !== "undefined") positionOptions.enableHighAccuracy = options.enableHighAccuracy;

    // Check if the cached object is sufficient
    if (this.cachedPosition !== null && this.cachedPosition.timestamp > ((new Date()).getTime() - positionOptions.maximumAge)) {
        successCallback(this.cachedPosition);
        return;
    }

    // Check if the timeout is 0, if yes invoke the ErrorCallback immediately
    if (positionOptions.timeout === 0) {
        errorCallback(PositionError.cast(PositionError.TIMEOUT, "Timeout"));
        return;
    }

    var timedOut = false;   // Flag for indicating a timeout
    var timeoutId = 0;   // Flag for indicating a successful location receive

    if (options.timeout > 0) {
        timeoutId = window.setTimeout(function() {
            // Request timed out, set status and execute errorCallback
            timedOut = true;
            timeoutId = 0;
            errorCallback(PositionError.cast(PositionError.TIMEOUT, "Timeout"));
        }, options.timeout);
    }

    // Call the native function and query for a new position
    var me = this;
    Cordova.exec(function(p_position) {
        received = true;

        if (timeoutId > 0) {
            window.clearTimeout(timeoutId);
        }

        // Cache the new position
        me.cachedPosition = p_position;

        // Execute the successCallback if not timed out
        if (!timedOut) successCallback(p_position);
    }, errorCallback, "com.cordova.Geolocation", "getCurrentPosition", [ positionOptions ]);
};

Geolocation.prototype.watchPosition = function(successCallback, errorCallback, options) {
    // Check the callbacks
    if (typeof successCallback !== "function") return;
    if (typeof errorCallback !== "function") errorCallback = function() {};

    var watchId = this.watchIds.length + 1; // +1 in order to avoid 0 as watchId
    this.watchIds[watchId] = true;
    var me = this;

    function doWatch() {
        me.getCurrentPosition(function(p_position) {
            if (!me.watchIds[watchId]) return;

            successCallback(p_position);

            // Wait some time before starting again
            setTimeout(doWatch, 100);
        }, function(p_positionError) {
            if (!me.watchIds[watchId]) return;

            errorCallback(p_positionError);
            // Wait some time before starting again
            setTimeout(doWatch, 100);
        }, options);
    }

    // Start watching for position changes (slight delay, in order to simulate asynchronous behaviour)
    setTimeout(doWatch, 100);

    return watchId;
};

Geolocation.prototype.clearWatch = function(watchId) {
    this.watchIds[watchId] = false;
};

Cordova.addConstructor("com.cordova.Geolocation", function () {
    // HACK: webkit doesn't allow replacing of navigator.geolocation
    function Navigator() {
    }
    Navigator.prototype = navigator;
    window.navigator = new Navigator();
    navigator.geolocation = new Geolocation();

    window.Position = Position;
    window.Coordinates = Coordinates;
});
/*
 *  Copyright 2011 Wolfgang Koller - http://www.gofg.at/
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

var _notificationBusy = false;

function Notification() {
}

function _showNotificationDialog(method, args, cb) {
    (function f1() {
        if (_notificationBusy) {
            setTimeout(f1, 150);
            return;
        }
        _notificationBusy = true;
        Cordova.exec(function(id, text) {
            _notificationBusy = false;
            cb(id, text);
        }, null, "com.cordova.Notification", method, args);
    })();
}

Notification.prototype.alert = function(message, alertCallback, title, buttonName) {
    if (!title)
        title = "Alert";
    if (!buttonName)
       buttonName = "OK";
    this.confirm(message, alertCallback, title, buttonName);
}

Notification.prototype.confirm = function(message, confirmCallback, title, buttonLabels) {
    if (!title)
        title = "Confirm";
    if (typeof(buttonLabels) === "string" ) {
        buttonLabels = buttonLabels.split(',').filter(function(str) {return str.length});
    } else {
        throw new Error("argument error");
    }
    if (!buttonLabels)
       buttonLabels = ["OK", "Cancel"];
    if (buttonLabels.length > 3)
       throw new Error("unsupported more then 3 buttons");
    _showNotificationDialog("confirm", [message, title, buttonLabels], confirmCallback);
}

Notification.prototype.prompt = function(message, confirmCallback, title, buttonLabels, defaultText) {
    if (!title)
        title = "Prompt";
    if (!buttonLabels)
       buttonLabels = ["OK", "Cancel"];
    if (buttonLabels.length > 3)
       throw new Error("unsupported more then 3 buttons");
    _showNotificationDialog("prompt", [message, title, buttonLabels, defaultText], confirmCallback);
}

Notification.prototype.beep = function(times) {
    Cordova.exec(null, null, "com.cordova.Notification", "beep", [times]);
}

Notification.prototype.vibrate = function(milliseconds) {
    Cordova.exec(null, null, "com.cordova.Notification", "vibrate", [milliseconds]);
}

Cordova.addConstructor("com.cordova.Notification", function () {
    navigator.notification = new Notification();
});
/*
 *  Copyright 2011  Integrated Computer Solutions - http://www.ics.com
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

function CompassHeading(p_heading, p_trueHeading, p_accuracy, timestamp) {
    if (p_heading !== undefined)
        this.magneticHeading = p_heading;
    if (p_trueHeading !== undefined)
        this.trueHeading = p_trueHeading || 0;
    if (p_accuracy !== undefined)
        this.headingAccuracy = p_accuracy || 0;
    this.timestamp = timestamp || 0;
};

CompassHeading.cast = function(heading, trueHeading, accuracy, timestamp){
    var that = new CompassHeading(heading, trueHeading, accuracy, timestamp);
    return that;
};

function CompassError() {
};

CompassError.cast = function (p_code, p_message) {
    var CompassError = new CompassError();
    CompassError.code = p_code;
    CompassError.message = p_message;

    return CompassError;
};

CompassError.COMPASS_INTERNAL_ERR = 0;
CompassError.COMPASS_NOT_SUPPORTED = 20;

CompassError.prototype.code = 0;
CompassError.prototype.message = "";

function HeadingOptions() {
};

function Compass() {
};

Compass.prototype.watchIds = [];
Compass.prototype.cachedHeading = null;

Compass.prototype.getCurrentHeading = function(successCallback, errorCallback, options) {
    if (typeof successCallback !== "function") return;
    if (typeof errorCallback !== "function") errorCallback = function() {};
    var headingOptions = new HeadingOptions();

    var me = this;
    Cordova.exec(function(p_heading) {
        received = true;
        me.cachedHeading = p_heading;
        successCallback(p_heading);
    }, errorCallback, "com.cordova.Compass", "getCurrentHeading", [ headingOptions ]);
    return me.cachedHeading;
};

Compass.prototype.watchHeading = function(successCallback, errorCallback, options) {
    if (typeof successCallback !== "function") return;
    if (typeof errorCallback !== "function") errorCallback = function() {};

    var watchId = this.watchIds.length + 1; // +1 in order to avoid 0 as watchId
    this.watchIds[watchId] = true;
    var me = this;

    function doWatch() {
        me.getCurrentHeading(function(p_heading) {
            if (!me.watchIds[watchId]) return;
            successCallback(p_heading);
            // Wait some time before starting again
            setTimeout(doWatch, 100);
        }, function(p_headingError) {
            if (!me.watchIds[watchId]) return;

            errorCallback(p_headingError);
            // Wait some time before starting again
            setTimeout(doWatch, 100);
        }, options);
    }

    // Start watching for heading changes (slight delay, in order to simulate asynchronous behaviour)
    setTimeout(doWatch, 100);

    return watchId;
};

Compass.prototype.clearWatch = function(watchId) {
    this.watchIds[watchId] = false;
};

Cordova.addConstructor("com.cordova.Compass", function () {
    navigator.compass = new Compass();
    window.CompassError = CompassError;
    window.CompassHeading = CompassHeading;
});
/*
 *  Copyright 2011  Integrated Computer Solutions - http://www.ics.com
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

function Acceleration(p_x,p_y,p_z,p_ts) {
    this.x = p_x || 0;
    this.y = p_y || 0;
    this.z = p_z || 0;
    this.timestamp = p_ts || 0;
    return this;
};

Acceleration.prototype.x = null;
Acceleration.prototype.y = null;
Acceleration.prototype.z = null;
Acceleration.prototype.timestamp = null;

Acceleration.cast = function (p_acceleration) {
    var acceleration = new Acceleration(p_acceleration.x,
                                        p_acceleration.y,
                                        p_acceleration.z,
                                        p_acceleration.timestamp);
    return acceleration;
};

function Accelerometer() {
};

Accelerometer.prototype.watchIds = [];

Accelerometer.prototype.getCurrentAcceleration = function (successCallback, errorCallback) {
    if (typeof successCallback !== "function") return;
    if (typeof errorCallback !== "function") errorCallback = function() {};

    Cordova.exec(successCallback, errorCallback, "com.cordova.Accelerometer", "getCurrentAcceleration", [ {} ]);
};

Accelerometer.prototype.watchAcceleration = function (successCallback, errorCallback, options) {
    if (typeof successCallback !== "function") return;
    if (typeof errorCallback !== "function") errorCallback = function() {};

    var watchId = this.watchIds.length + 1; // +1 in order to avoid 0 as watchId
    this.watchIds[watchId] = true;

    var frequency=10000;
    if (options && typeof(options.frequency) === "number") {
        frequency=options.frequency;
    }

    var self = this;
    function doWatch() {
        self.getCurrentAcceleration(function (p_acceleration) {
            if (!self.watchIds[watchId]) return;
            successCallback(p_acceleration);

            setTimeout(doWatch, frequency);
        }, function () {
            if (!self.watchIds[watchId]) return;

            errorCallback(p_accelerationError);
        });
    }

    setTimeout(doWatch, frequency);
    return watchId;
};

Accelerometer.prototype.clearWatch = function(watchId) {
    this.watchIds[watchId] = false;
};

Cordova.addConstructor("com.cordova.Accelerometer", function () {
    window.Acceleration = Acceleration;
    navigator.accelerometer = new Accelerometer();
});
/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

function Camera(){
   this.DestinationType = Camera.DestinationType;
   this.PictureSourceType = Camera.PictureSourceType;
   this.EncodingType = Camera.EncodingType;
   this.MediaType = Camera.MediaType;
   return this;
}

Camera.DestinationType = {
    DATA_URL : 0,
    FILE_URI : 1,
    NATIVE_URI: 2
};

Camera.PictureSourceType = {
    PHOTOLIBRARY : 0,
    CAMERA : 1,
    SAVEDPHOTOALBUM : 2
};


Camera.EncodingType = {
     JPEG : 0,               // Return JPEG encoded image
     PNG : 1                 // Return PNG encoded image
};

Camera.MediaType = {
     PICTURE : 0,
     VIDEO : 1,
     ALLMEDIA: 2
};

function CameraOptions(override) {
    var options = { quality : 75,
                    destinationType : Camera.DestinationType.DATA_URL,
                    sourceType : Camera.PictureSourceType.CAMERA,
                    allowEdit : true,
                    encodingType: Camera.EncodingType.JPEG,
                    targetWidth: 100,
                    targetHeight: 100 };
    for (var key in options) {
        if (!(options.hasOwnProperty(key) && override.hasOwnProperty(key)))
            continue;
        if (typeof(options[key]) !== typeof(override[key]))
            continue;
        //TODO: check value limits
        options[key] = override[key];
    }
    options['limit'] = 1;

    return options;
};

Camera.prototype.getPicture = function(successCallback, errorCallback, options) {
    if (typeof(successCallback) !== "function") return;
    if (typeof(errorCallback) !== "function") errorCallback = function() {};
    if (typeof(options) !== "object") object = {};

    Cordova.exec(successCallback, errorCallback, "com.cordova.Camera", "getPicture", [ new CameraOptions(options) ]);
};

Cordova.addConstructor("com.cordova.Camera", function () {
    window.navigator.camera = new Camera();
    window.Camera = Camera;
});
/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

function ContactAddress(pref, type, formatted, streetAddress, locality, region, postalCode, country) {
    if (pref)
        this.pref = pref;
    if (type)
        this.type = type;
    if (formatted)
        this.formatted = formatted;
    if (streetAddress)
        this.streetAddress = streetAddress;
    if (locality)
        this.locality = locality;
    if (region)
        this.region = region;
    if (postalCode)
        this.postalCode = postalCode;
    if (country)
        this.country = country;
}

ContactAddress.create = function(obj) {
    var result = new ContactAddress()
    result.pref = obj.pref
    result.type = obj.type
    result.formatted = obj.formatted
    result.streetAddress = obj.streetAddress
    result.locality = obj.streetLocality
    result.region = obj.region
    result.postalCode = obj.postalCode
    result.country = obj.country
    return result
}

ContactAddress.prototype = {
    pref: false,
    type: "",
    formatted: "",
    streetAddress: "",
    locality: "",
    region: "",
    postalCode: "",
    country: ""
};

function ContactField(type, value, pref) {
    this.type = String(type);
    this.value = String(value);
    this.pref = pref;
}

ContactField.create = function(obj) {
    var result = new ContactField()
    result.type = obj.type;
    result.value = obj.value;
    result.pref = obj.pref;
    return result;
}

ContactField.prototype = {
    type: "",
    value: "",
    pref: false
};

function ContactFindOptions(filter, multiple) {
    if (filter)
        this.filter = filter;
    if (multiple)
        this.multiple = multiple;
}

ContactFindOptions.create = function(obj) {
    var result = new ContactFindOptions();
    result.filter = obj.filter;
    result.multiple = obj.multiple;
    return result;
}

ContactFindOptions.prototype.filter = "";
ContactFindOptions.prototype.multiple = false;


function ContactName(formatted, familyName, givenName, middleName, honorificPrefix, honorificSuffix) {
    if (formatted)
       this.formatted = formatted;
    if (familyName)
       this.familyName = familyName;
    if (givenName)
       this.givenName = givenName;
    if (middleName)
       this.middleName = middleName;
    if (honorificPrefix)
       this.honorificPrefix = honorificPrefix;
    if (honorificSuffix)
       this.honorificSuffix = honorificSuffix;
}

ContactName.create = function(obj) {
    var result = new ContactName()
    result.familyName = obj.familyName
    result.givenName = obj.givenName
    result.formatted = obj.formatted
    result.middleName = obj.middleName
    result.honorificPrefix = obj.honorificPrefix
    result.honorificSuffix = obj.honorificSuffix
    var formattedArr = []

    if (typeof result.honorificPrefix === 'undefined')
        result.honorificPrefix = "";
    else if (result.honorificPrefix !== "")
        formattedArr.push(result.honorificPrefix);

    if (typeof result.givenName === 'undefined')
        result.givenName = "";
    else if (result.givenName !== "")
        formattedArr.push(result.givenName);

    if (typeof result.middleName === 'undefined')
        result.middleName = "";
    else if (result.middleName !== "")
        formattedArr.push(result.middleName);

    if (typeof result.familyName == 'undefined')
        result.familyName = "";
    else if (result.familyName !== "")
        formattedArr.push(result.familyName);

    if (typeof result.honorificSuffix == 'undefined')
        result.honorificSuffix = "";
    else if (result.honorificSuffix !== "")
        formattedArr.push(result.honorificSuffix);

    return result;
}

ContactName.prototype = {
    formatted: "",
    familyName: "",
    givenName: "",
    middleName: "",
    honorificPrefix: "",
    honorificSuffix: ""
};

function ContactOrganization(pref, type, name, department, title) {
    if (pref)
        this.pref = pref;
    if (type)
        this.type = type;
    if (name)
        this.name = name;
    if (department)
        this.department = department;
    if (title)
        this.title = title;
}

ContactOrganization.create = function(obj) {
    var result = new ContactOrganization()
    result.pref = obj.pref
    result.type = obj.type
    result.name = obj.name
    result.department = obj.department
    result.title = obj.title
    return result
}

ContactOrganization.prototype = {
    pref: false,
    type: "",
    name: "",
    department: "",
    title: ""
};

function ContactError(code) {
    if (code)
        this.code = code;
}

ContactError.UNKNOWN_ERROR = 0;
ContactError.INVALID_ARGUMENT_ERROR = 1;
ContactError.TIMEOUT_ERROR = 2;
ContactError.PENDING_OPERATION_ERROR = 3;
ContactError.IO_ERROR = 4;
ContactError.NOT_SUPPORTED_ERROR = 5;
ContactError.PERMISSION_DENIED_ERROR = 20;

ContactError.prototype.code = ContactError.UNKNOWN_ERROR

function Contact(p_id, p_displayName, p_name, p_nickname,
                 p_phoneNumbers,
                 p_emails,
                 p_addresses,
                 p_ims,
                 p_organizations,
                 p_birthday,
                 p_note,
                 p_photos,
                 p_categories,
                 p_urls) {
    this.id = p_id || "";
    this.displayName = p_displayName || "";

    if (typeof(p_name) == 'object') {
        this.name = ContactName.create(p_name);
    } else {
        this.name = new ContactName();
    }

    this.nickname = p_nickname || "";
    this.phoneNumbers = p_phoneNumbers || null;
    this.emails = p_emails || null;
    this.addresses = p_addresses || null;
    this.ims = p_ims || null;
    this.organizations = p_organizations || null;
    this.birthday = p_birthday || "";
    this.note = p_note || "";
    this.photos = p_photos || null;
    this.categories = p_categories || null;
    this.urls = p_urls || null;
}

Contact.create = function(obj) {
    var result = new Contact();
    result.id = obj.id;
    result.displayName = obj.displayName;
    result.name = ContactName.create(obj.name);
    result.nickname = obj.nickname || null;
    var subObj;
    if (obj.phoneNumbers)
        result.phoneNumbers = [];
    for (subObj in obj.phoneNumbers)
        result.phoneNumbers.push(ContactField.create(obj.phoneNumbers[subObj]));
    if (obj.emails)
        result.emails = [];
    for (subObj in obj.emails)
        result.emails.push(ContactField.create(obj.emails[subObj]));
    if (obj.addresses)
        result.addresses = [];
    for (subObj in obj.addresses)
        result.addresses.push(ContactAddress.create(obj.addresses[subObj]));
    if (obj.ims)
        result.ims = [];
    for (subObj in obj.ims)
        result.ims.push(ContactField.create(obj.ims[subObj]));
    if (obj.organizations)
        result.organizations = [];
    for (subObj in obj.organizations)
        result.organizations.push(ContactOrganization.create(obj.organizations[subObj]));
    result.birthday = obj.birthday;
    result.note = obj.note;
    result.gender = obj.gender;
    if (obj.photos)
        result.photos = [];
    for (subObj in obj.photos)
        result.photos.push(ContactField.create(obj.photos[subObj]));
    if (obj.categories)
        result.categories = [];
    for (subObj in obj.categories)
        result.categories.push(ContactField.create(obj.categories[subObj]));
    if (obj.urls)
        result.urls = [];
    for (subObj in obj.urls)
        result.urls.push(ContactField.create(obj.urls[subObj]));

    return result;
}

Contact.prototype = {
    id: null,
    displayName: "",
    nickname: "",
    note: ""
};

Contact.prototype.clone = function() {
    var newContact = Contact.create(this);
    newContact.id = null;
    return newContact;
}

Contact.prototype.remove = function(contactSuccess, contactError) {
    if (typeof(contactSuccess) !== "function") contactSuccess = function() {}
    if (typeof(contactError) !== "function") contactError = function() {}

    if (!this.id) {
        contactError(new ContactError(ContactError.UNKNOWN_ERROR));
        return;
    }

    Cordova.exec(contactSuccess, contactError, "com.cordova.Contacts", "removeContact", [ this.id ]);
}

Contact.prototype.save = function(contactSuccess,contactError) {
    if (typeof(contactSuccess) !== "function") contactSuccess = function() {}
    if (typeof(contactError) !== "function") contactError = function() {}
    var clone = this.clone();
    clone.id = this.id;
    if (clone.birthday)
        clone.birthday = clone.birthday.getTime();
    Cordova.exec(contactSuccess, contactError, "com.cordova.Contacts", "saveContact", [ clone ]);
}

function ContactsManager() {
}

ContactsManager.prototype.create = function(properties) {
    return Contact.create(properties);
}

ContactsManager.prototype.find = function(contactFields, contactSuccess, contactError, contactFindOptions) {
    if (typeof contactSuccess !== "function") {throw "no callback";}
    if (typeof contactError !== "function") {
        contactError = function() {}
    }
    Cordova.exec(contactSuccess, contactError, "com.cordova.Contacts", "findContacts", [ contactFields, contactFindOptions.filter, contactFindOptions.multiple ])
}

Cordova.addConstructor("com.cordova.Contacts", function () {
    navigator.contacts = new ContactsManager()
    window.ContactFindOptions = ContactFindOptions;
    window.Contact = Contact;
    window.ContactName = ContactName;
    window.ContactField = ContactField;
    window.ContactAddress = ContactAddress;
    window.ContactOrganization = ContactOrganization;
    window.ContactError = ContactError;
});

var _mediaPlayerLastId = 1;

function Media(src, mediaSuccess, mediaError, mediaStatus) {
    if (typeof(mediaError) !== "function") {
        mediaError = new Function();
    }
    if (typeof(mediaStatus) !== "function") {
        mediaStatus = new Function();
    }

    this.src = src;
    this.id = _mediaPlayerLastId++;
    this._duration = -1;
    this._position = -1;
    this._timeoutId = 0;

    Cordova.exec(null, mediaError, "com.cordova.Media", "newPlayer", [src, this.id]);
    Cordova.exec(mediaSuccess, mediaStatus, "com.cordova.Media", "playerSetCallbacks", [ { id: this.id } ]);
}

Media.prototype = {
    seekTo: function (position) {
        if (typeof(position) !== "number") return;
        Cordova.exec(null, null, "com.cordova.Media", "seekTo", [ { id: this.id, position: position } ]);
    },

    setVolume: function (level) {
        if (typeof mediaSuccess !== "number") return;

        Cordova.exec(null, null, "com.cordova.Media", "setVolume", [ { id: this.id, volume: level } ]);
    },

    getCurrentPosition: function (mediaSuccess, mediaError) {
        if (typeof mediaSuccess !== "function") return;
        var self = this;
        Cordova.exec(function (position) {
            self._position = position;
            mediaSuccess(position);
        }, null, "com.cordova.Media", "getCurrentPosition", [ { id: this.id } ]);
    },

    getDuration: function () {
        var self = this;

        Cordova.exec(function (duration) {
            if (duration <= 0 && !self._timeoutId)
                self._timeoutId = setTimeout(self.getDuration.bind(self), 500);
            self._duration = duration;
        }, null, "com.cordova.Media", "getDuration", [ { id: this.id } ]);
        return this._duration;
    },

    play: function () {
        this.getDuration();
        Cordova.exec(null, null, "com.cordova.Media", "play", [ { id: this.id } ]);
    },

    pause: function () {
        this.getDuration();
        Cordova.exec(null, null, "com.cordova.Media", "pause", [ { id: this.id } ]);
    },

    stop: function () {
        this.getDuration();
        Cordova.exec(null, null, "com.cordova.Media", "stop", [ { id: this.id } ]);
    },


    release: function () {
        if (this._timeoutId) {
            this._timeoutId = 0;
            clearTimeout(this._timeoutId);
        }
        Cordova.exec(null, null, "com.cordova.Media", "releasePlayer", [ { id: this.id } ]);
    },

    startRecord: function () {
        Cordova.exec(null, null, "com.cordova.Media", "startRecording", [ { id: this.id } ]);
    },

    stopRecord: function () {
        Cordova.exec(null, null, "com.cordova.Media", "stopRecording", [ { id: this.id } ]);
    }
};

Media.MEDIA_NONE = 0;
Media.MEDIA_STARTING = 1;
Media.MEDIA_RUNNING = 2;
Media.MEDIA_PAUSED = 3;
Media.MEDIA_STOPPED = 4;

function MediaError(code, message) {
    this.code = code;
    this.message = message;
}

MediaError.MEDIA_ERR_NONE_ACTIVE = 0;
MediaError.MEDIA_ERR_ABORTED = 1;
MediaError.MEDIA_ERR_NETWORK = 2;
MediaError.MEDIA_ERR_DECODE = 3;
MediaError.MEDIA_ERR_NONE_SUPPORTED = 4;

Cordova.addConstructor("com.cordova.Media", function() {
    window.Media = Media;
    window.MediaError = MediaError;
});

function GlobalizationError(code, message) {
    this.code = code;
    this.message = message;
}

GlobalizationError.UNKNOWN_ERROR = 0;
GlobalizationError.FORMATTING_ERROR = 1;
GlobalizationError.PARSING_ERROR = 2;
GlobalizationError.PATTERN_ERROR = 3;

function convertStringToDateOptions(override) {
    var options = { formatLength: 'short', selector: 'date and time' };

    if (override) {
        for (var key in options) {
            if (!options.hasOwnProperty(key))
                continue;
            if (typeof(options[key]) !== typeof(override[key]))
                continue;
            options[key] = override[key];
        }
    }
    var formats = ["short", "medium", "long", "full"];
    var selectors = ["date", "time", "date and time"];

    options.formatLength = formats.indexOf(options.formatLength);
    options.selector = selectors.indexOf(options.selector);
    //TODO: throw error
    if (options.formatLength === -1)
        options.formatLength = 0;
    if (options.selector === -1)
        options.selector = 0;

    return options;
}

function convertStringToNumberOptions(override) {
    var options = { type: 'decimal' };
    //TODO: make function
    if (override) {
        for (var key in options) {
            if (!options.hasOwnProperty(key))
                continue;
            if (typeof(options[key]) !== typeof(override[key]))
                continue;
            options[key] = override[key];
        }
    }

    var types = [ 'decimal', 'percent', 'currency' ];
    options.type = types.indexOf(options.type);
    if (options.type === -1)
        options.type = 0;

    return options;
}

function isInt(n) {
   return n % 1 === 0;
}

var Globalization = {
    getPreferredLanguage: function (successCB, errorCB) {
        Cordova.exec(successCB, null, "com.cordova.Globalization", "getPreferredLanguage", [ { } ]);
    },

    getLocaleName: function (successCB, errorCB) {
        if (typeof(successCB) != "function") return;
        successCB({ value: navigator.language.replace('-', '_') });
    },

    dateToString: function (date, successCB, errorCB, override) {
        if (!(date instanceof Date)) return;
        if (typeof(successCB) != "function") return;
        if (typeof(errorCB) != "function") errorCB = new Function();

        var options = convertStringToDateOptions(override);
        Cordova.exec(successCB, errorCB, "com.cordova.Globalization", "dateToString",
                     [ { time_t: date.getTime(), formatLength: options.formatLength, selector: options.selector } ]);
    },

    stringToDate: function (dateString, successCB, errorCB, override) {
        if (typeof(dateString) !== 'string') return;
        if (typeof(successCB) != "function") return;
        if (typeof(errorCB) != "function") errorCB = new Function();

        var options = convertStringToDateOptions(override);
        Cordova.exec(successCB, errorCB, "com.cordova.Globalization", "stringToDate",
                     [ { dateString: dateString, formatLength: options.formatLength, selector: options.selector } ]);
    },

    getDateNames: function (successCB, errorCB, override) {
        if (typeof(successCB) != "function") return;
        if (typeof(errorCB) != "function") errorCB = new Function();
        var options = { type: 'wide', item: 'months' };

        if (override) {
            for (var key in options) {
                if (!options.hasOwnProperty(key))
                    continue;
                if (typeof(options[key]) !== typeof(override[key]))
                    continue;
                options[key] = override[key];
            }
        }

        var requests = ["days", "months"];
        var formats = ["narrow", "wide"];

        options.item = requests.indexOf(options.item);
        options.type = formats.indexOf(options.type);

        //TODO: throw error
        if (options.item === -1)
            options.item = 0;
        if (options.type === -1)
            options.type = 0;

        Cordova.exec(successCB, errorCB, "com.cordova.Globalization", "getDateNames",
                     [ options ]);
    },

    isDayLightSavingsTime: function (date, successCB, errorCB) {
        if (!(date instanceof Date)) return;

        Cordova.exec(successCB, errorCB, "com.cordova.Globalization", "isDayLightSavingsTime",
                     [ { time_t: date.getTime() } ]);
    },

    getFirstDayOfWeek: function (successCB, errorCB) {
        if (typeof(successCB) != "function") return;

        Cordova.exec(successCB, errorCB, "com.cordova.Globalization", "getFirstDayOfWeek",
                     [ { } ]);
    },

    numberToString: function (number, successCB, errorCB, override) {
        if (typeof(number) !== "number") return;
        if (typeof(successCB) !== "function") return;
        if (typeof(errorCB) !== "function") errorCB = new Function();

        var options = convertStringToNumberOptions(override);

        Cordova.exec(successCB, errorCB, "com.cordova.Globalization", "numberToString",
                     [ { type: options.type, isInt: isInt(number), number: number } ]);
    },

    stringToNumber: function (string, successCB, errorCB, override) {
        if (typeof(string) !== "string") return;
        if (typeof(successCB) !== "function") return;
        if (typeof(errorCB) !== "function") errorCB = new Function();

        var options = convertStringToNumberOptions(override);
        Cordova.exec(successCB, errorCB, "com.cordova.Globalization", "stringToNumber",
                     [ options.type, string ]);
    },

    getNumberPattern: function (successCB, errorCB, override) {
        if (typeof(successCB) !== "function") return;
        if (typeof(errorCB) !== "function") errorCB = new Function();

        var options = convertStringToNumberOptions(override);
        Cordova.exec(successCB, errorCB, "com.cordova.Globalization", "getNumberPattern",
                     [ options.type ]);
    },

    getCurrencyPattern: function (currencyCode, successCB, errorCB) {
        if (typeof(errorCB) !== "function") errorCB = new Function();

        //TODO: implement
        errorCB(new GlobalizationError(GlobalizationError.PATTERN_ERROR, "unimplemented"))
    },

    getDatePattern: function (successCB, errorCB, override) {
        if (typeof(successCB) !== "function") return;
        if (typeof(errorCB) !== "function") errorCB = new Function();

        var options = convertStringToDateOptions(override);
        Cordova.exec(successCB, errorCB, "com.cordova.Globalization", "getDatePattern",
                     [ options.formatLength, options.selector ]);
    }
};

Cordova.addConstructor("com.cordova.Globalization", function() {
    window.GlobalizationError = GlobalizationError;
    navigator.globalization = Globalization;
});
function CaptureAudioOptions(override) {
    this.limit = 1;
    this.duration = -1;
    this.mode = "audio/amr";
    if (typeof(override) === 'object') {
        //TODO: throw exception
        if (typeof(override.limit) == typeof(this.limit) && override.limit >= 1)
            this.limit = override.limit;
        if (typeof(override.mode) == typeof(this.mode) && navigator.device.capture.supportedAudioModes.indexOf(override.mode) !== -1)
            this.mode = override.mode;
    }
}

function CaptureImageOptions(override) {
    this.limit = 1;
    this.mode = "image/jpeg";
    if (typeof(override) === 'object') {
        //TODO: throw exception
        if (typeof(override.limit) == typeof(this.limit) && override.limit >= 1)
            this.limit = override.limit;
        if (typeof(override.mode) == typeof(this.mode) && navigator.device.capture.supportedImageModes.indexOf(override.mode) !== -1)
            this.mode = override.mode;
    }
}

function CaptureVideoOptions(override) {
    this.limit = 1;
    this.duration = -1;
    this.mode = "video/3gpp";
    if (typeof(override) === 'object') {
        //TODO: throw exception
        if (typeof(override.limit) == typeof(this.limit) && override.limit != 0)
            this.limit = override.limit;
        if (typeof(override.mode) == typeof(this.mode) && override.mode in navigator.device.capture.supportedVideoModes)
            this.mode = override.mode;
    }
}

function CaptureError(code) {
    if (code) {
        this.code = code;
    } else {
        this.code = CaptureError.CAPTURE_INTERNAL_ERR;
    }
}
CaptureError.CAPTURE_INTERNAL_ERR = 0;
CaptureError.CAPTURE_APPLICATION_BUSY = 1;
CaptureError.CAPTURE_INVALID_ARGUMENT = 2;
CaptureError.CAPTURE_NO_MEDIA_FILES = 3;
CaptureError.CAPTURE_NOT_SUPPORTED = 4;

function MediaFile(name, fullPath, type, lastModifiedDate, size) {
    if (name)
        this.name = name;
    else
        this.name = "";
    if (fullPath)
        this.fullPath = fullPath;
    else
        this.fullPath = "";
    if (type)
        this.type = type;
    else
        this.type = "";
    if (lastModifiedDate)
        this.lastModifiedDate = lastModifiedDate;
    else
        this.lastModifiedDate = 0;
    if (size)
        this.size = size;
    else
        this.size = 0;
    this.getFormatData = function() {}
}

function MediaFileData(codecs, bitrate, height, width, duration) {
    if (codecs)
        this.codecs = codecs;
    else
        this.codecs = "";
    if (bitrate)
        this.bitrate = bitrate;
    else
        this.bitrate = 0;
    if (this.height)
        this.height = height;
    else
        this.height = 0;
    if (this.width)
        this.width = width;
    else
        this.width = 0;
    if (this.duration)
        this.duration = duration;
    else
        this.duration = 0;
}

function Capture() {
    Cordova.deviceready.freeze();

    this.supportedAudioModes = [];
    this.supportedImageModes = [];
    this.supportedVideoModes = [];

    var self = this;
    Cordova.exec(function (audioCodecs, videoCodecs, imageFormats) {
        self.supportedAudioModes = audioCodecs;
        self.supportedVideoModes = videoCodecs;
        self.supportedImageModes = imageFormats;
        Cordova.deviceready.unfreeze();
    }, null, "com.cordova.Capture", "getSupportedFormats", []);
}

function makeCallback(captureSuccess, captureError) {
    return function (files) {
        var i = 0;
        var result = [];
        function getFileInfo() {
            var fileEntry = new FileEntry();
            if (files[i].match(/^file:\/\//))
                files[i] = files[i].substr('file://'.length);
            fileEntry.fullPath = files[i];

            fileEntry.file(handleFile, function() {
                captureError(new CaptureError());
            });
        }

        function handleFile(file) {
            result.push(new MediaFile(file.name, file.fullPath, file.type, file.lastModifiedDate, file.size));
            if (files.length <= ++i) {
                captureSuccess(result);
            } else {
                getFileInfo();
            }
        }
        getFileInfo();
    };
}

Capture.prototype = {
    captureAudio: function(captureSuccess, captureError, options) {
        if (typeof(captureError) != 'function')
            captureError = new Function();
        options = new CaptureAudioOptions(options);
        Cordova.exec(makeCallback(captureSuccess, captureError), function (msg) {
            if (msg === 'canceled') {
                captureError(new CaptureError(CaptureError.CAPTURE_NO_MEDIA_FILES));
            } else {
                captureError(new CaptureError(CaptureError.CAPTURE_APPLICATION_BUSY));
            }
        }, "com.cordova.Capture", "startAudioRecordApp", [ options ]);
    },

    captureImage: function(captureSuccess, captureError, options) {
        if (typeof(captureSuccess) != 'function')
            return;
        if (typeof(captureError) != 'function')
            captureError = new Function();
        options = new CaptureImageOptions(options);
        var cameraOptions = { quality: 75,
                              sourceType: Camera.PictureSourceType.CAMERA,
                              destinationType: Camera.DestinationType.FILE_URI,
                              allowEdit: true,
                              captureAPI: true,
                              encodingType: Camera.EncodingType.JPEG,//FIXME should be options.mode
                              limit: options.limit };
        Cordova.exec(makeCallback(captureSuccess, captureError), function (msg) {
            if (msg === 'canceled') {
                captureError(new CaptureError(CaptureError.CAPTURE_NO_MEDIA_FILES));
            } else {
                captureError(new CaptureError(CaptureError.CAPTURE_APPLICATION_BUSY));
            }
        }, "com.cordova.Camera", "getPicture", [ cameraOptions ]);
    },

    captureVideo: function(captureSuccess, captureError, options) {
        if (typeof(captureSuccess) != 'function')
            return;
        if (typeof(captureError) != 'function')
            captureError = new Function();

        options = new CaptureImageOptions(options);
        Cordova.exec(function(files) {
            console.log(String(files));
        }, function (msg) {
            if (msg === 'canceled') {
                captureError(new CaptureError(CaptureError.CAPTURE_NO_MEDIA_FILES));
            } else {
                captureError(new CaptureError(CaptureError.CAPTURE_APPLICATION_BUSY));
            }
        }, "com.cordova.Camera", "recordVideo", [ options ]);
    }
};

Cordova.addConstructor("com.cordova.Capture", function () {
    if (!window.navigator.device) {
        window.navigator.device = {};
    }

    window.navigator.device.capture = new Capture();
    window.MediaFile = MediaFile;
    window.CaptureError = CaptureError;
    window.MediaFileData = MediaFileData;
    window.MediaFile = MediaFile;
    window.CaptureAudioOptions = CaptureAudioOptions;
    window.CaptureImageOptions = CaptureImageOptions;
    window.CaptureVideoOptions = CaptureVideoOptions;
});

function unsupported() {
    throw new Error("unsupported");
}

App = {
    loadUrl:function(url, props) {
        if (typeof(props) !== 'object' || !props.openExternal)
            throw new Error("unsupported");
        Cordova.exec(null, null, "com.cordova.App", "loadUrl", [ url ]);
    },
    closeApp: function() {
        Cordova.exec(null, null, "com.cordova.App", "exitApp", []);
    },

    cancelLoadUrl: unsupported,
    clearCache: unsupported,
    clearHistory: unsupported,
    backHistory: unsupported,
    overrideBackbutton: unsupported
};

Cordova.addConstructor("com.cordova.App", function() {
    window.navigator.app = App;
});
var Splashscreen = {
    show: function() {
        Cordova.exec(null, null, "com.cordova.Splashscreen", "show", []);
    },

    hide: function() {
        Cordova.exec(null, null, "com.cordova.Splashscreen", "hide", []);
    }
};

Cordova.addConstructor("com.cordova.Splashscreen", function () {
    navigator.splashscreen = Splashscreen;
});
var systemWindowOpen = null;

function openBrowser(url, target, options) {
    if (!url || typeof(url) != "string")
        return;
    if (!target || typeof(target) != "string")
        target = "_self";
    if (!options || typeof(options) != "string")
        options = "location=yes";

    if (target === "_self") {
        systemWindowOpen(url, "_self");
        return;
    }
    if (target === "_system") {
        // TODO: don't allow relative url
        Cordova.exec(null, null, "com.cordova.App", "loadUrl", [ url ]);
        return;
    }

    var ref = {
        events: {
            loadstart: new Cordova.EventHandler("loadstart"),
            loadend: new Cordova.EventHandler("loadend"),
            close: new Cordova.EventHandler("close")
        },

        addEventListener: function(eventname, callback) {
            ref.events[eventname].addEventListener(callback);
        },

        removeEventListener: function(eventname, callback) {
            ref.events[eventname].removeEventListener(callback);
        },

        close: function() {
            Cordova.exec(null, null, "com.cordova.InAppBrowser", "close", [ url ]);
        }
    };
    Cordova.exec(function() {
        ref.events.loadend.dispatchEvent()
    }, function() {
        ref.events.close.dispatchEvent()
    }, "com.cordova.InAppBrowser", "loadUrl", [ url ]);
    return ref;
}

Cordova.addConstructor("com.cordova.InAppBrowser", function () {
    if (systemWindowOpen)
        return;
    systemWindowOpen = window.open;
    window.open = openBrowser;
});
})();
