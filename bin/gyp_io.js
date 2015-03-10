#! /usr/bin/env node
/**
 * XadillaX created at 2015-03-09 16:15:21
 *
 * Copyright (c) 2015 Huaban.com, all rights
 * reserved
 */
var async = require("async");
var request = require("request");
var spidex = require("spidex");
var fs = require("fs");
var http = require("http");
var Hosts = require("../lib/hosts");
var opts = require("nomnom")
    .script("gyp-io")
    .option("stay-hosts", {
        abbr: "s",
        flag: true,
        help: "stay the hosts, not modify it"
    })
    .parse();
var hosts;

var LOCAL_IP = "127.0.0.1";
var NODE_HOST = "nodejs.org";
var IO_BASE_URI = "https://iojs.org";

function updateHosts(hosts, callback) {
    if(undefined === callback) callback = function(){};
    hosts.add(
        LOCAL_IP,
        NODE_HOST,
        "add via gyp_io, https://github.com/XadillaX/gyp-io-service");

    fs.writeFile("/etc/hosts", hosts.stringify(), { encoding: "utf8" }, callback);
}

function resumeHosts(hosts, callback) {
    if(undefined === callback) callback = function(){};
    hosts.removeByIpAndHost(LOCAL_IP, NODE_HOST);
    fs.writeFile("/etc/hosts", hosts.stringify(), { encoding: "utf8" }, callback);
}

function createServer() {
    console.log("[gyp-io] Creating dummy server...");

    var server = http.createServer(function(req, resp) {
        var path = IO_BASE_URI + req.url.replace("node", "iojs");
        var charset = path.indexOf(".txt") >= 0 ? "utf8" : "binary";

        console.log("[gyp-io] Fetching " + path + "...");
        if(charset === "binary") {
            request.get(path).pipe(resp);
            console.log("[gyp-io] Piping " + path);
        } else {
            spidex.get(path, {
                charset: "utf8"
            }, function(data, status) {
                if(200 !== status) {
                    console.warn("[gyp-io] Failed to fetch " + path);
                    resp.writeHead(502, "Failed to fetch");
                    return resp.end();
                }

                data = data.replace(/iojs/g, "node");

                resp.writeHead(200);
                resp.end(data, charset === "utf8" ? "utf8" : undefined);
                console.log("[gyp-io] " + path + " finished.");
            });
        }
    });

    server.listen(80, "0.0.0.0", function(err) {
        if(err) {
            resumeHosts(hosts);
            return console.err("[gyp-io] Failed to listen server: " + err.message);
        }

        console.log("[gyp-io] Dummy server created.");
    });
}

async.waterfall([
    function(callback) {
        if(opts["stay-hosts"]) return callback(undefined, "");
        fs.readFile("/etc/hosts", { encoding: "utf8" }, callback);
    },

    function(str, callback) {
        if(opts["stay-hosts"]) return callback(undefined, "");
        process.on("SIGINT", function() {
            resumeHosts(hosts, function(err) {
                if(err) {
                    console.error("[gyp-io] Hosts table resumed failed. Please edit it manually.");
                } else {
                    console.log("[gyp-io] Hosts table resumed.");
                }

                process.exit(0);
            });
        });

        callback(undefined, str);
    },

    function(str, callback) {
        if(opts["stay-hosts"]) return callback();
        hosts = new Hosts(str);
        updateHosts(hosts, function(err) {
            if(err) {
                console.error("[gyp-io] Hosts table failed to modify: " + err.message);
                return callback(err);
            }

            console.log("[gyp-io] Hosts table modified.");
            callback();
        });
    }
], function(err) {
    if(err) {
        resumeHosts(hosts);
        return console.error(err.message);
    }

    createServer();
});

