/**
 * XadillaX created at 2015-03-09 16:26:44
 *
 * Copyright (c) 2015 Huaban.com, all rights
 * reserved
 */
require("sugar");

var Hosts = function(str) {
    this._parse(str);
};

Hosts.prototype.findByIp = function(ip) {
    return this._array.reduce(function(res, obj) {
        if(obj.ip === ip) res.push(obj);
        return res;
    }, []);
};

Hosts.prototype.findByHost = function(host) {
    return this._array.reduce(function(res, obj) {
        if(obj.host === host) res.push(obj);
        return res;
    }, []);
};

Hosts.prototype.findByIpAndHost = function(ip, host) {
    return this._array.reduce(function(res, obj) {
        if(obj.host === host && obj.ip === ip) res.push(obj);
        return res;
    }, []);
};

Hosts.prototype.edit = function(obj, ip, host, comment) {
    if(!ip || !host) return false;
    if(!obj.ip || !obj.host) return false;
    obj.ip = ip, obj.host = host;
    if(comment !== undefined) {
        obj.comment = comment;
        if(!obj.comment.startsWith("#")) {
            obj.comment = "# " + obj.comment;
        }

    }

    obj.orig = obj.ip + "\t" + obj.host + "\t" + obj.comment;
    return true;
};

Hosts.prototype.editAt = function(i, ip, host, comment) {
    if(i < 0 || i >= this._array.length) return false;
    return this.edit(this._array[i], ip, host, comment);
};

Hosts.prototype.add = function(ip, host, comment) {
    if(!ip || !host) return false;

    if(comment && !comment.startsWith("#")) comment = "# " + comment;

    this._array.push({
        orig: ip + "\t" + host + (comment ? ("\t" + comment) : ""),
        ip: ip,
        host: host,
        comment: comment || "",
        unknown: ""
    });

    return true;
};

Hosts.prototype.removeByIp = function(ip) {
    this._array.remove(function(n) {
        return n.ip === ip;
    });
};

Hosts.prototype.removeByHost = function(host) {
    this._array.remove(function(n) {
        return n.host === host;
    });
};

Hosts.prototype.removeByIpAndHost = function(ip, host) {
    this._array.remove(function(n) {
        return n.ip === ip && n.host === host;
    });
};

Hosts.prototype._parse = function(str) {
    this._array = str.split("\n").map(function(line) {
        var orig = line;
        var comment = "";
        var ip = "";
        var host = "";
        var unknown = "";

        var sharpPos = line.indexOf("#");
        if(sharpPos >= 0) {
            comment = line.substr(sharpPos);
            line = line.substr(0, sharpPos);
        }

        if(line.indexOf(" ") >= 0 || line.indexOf("\t") >= 0) {
            var temp = line.split(" ").join("\t").split("\t").compact(true);

            if(temp.length === 2 && temp[0] && temp[1]) {
                ip = temp[0].trim();
                host = temp[1].trim();
            } else {
                unknown = line;
            }
        } else {
            unknown = line;
        }

        return {
            orig    : orig,
            ip      : ip,
            host    : host,
            comment : comment,
            unknown : unknown
        };
    });
};

Hosts.prototype.getHosts = function() {
    return this._array;
};

Hosts.prototype.stringify = function() {
    return this._array.map(function(n) {
        return n.orig;
    }).join("\n");
};

module.exports = Hosts;

