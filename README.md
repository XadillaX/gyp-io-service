# GYP io.js Temporary Support

Temporary solution to let node-gyp run `rebuild` under io.js.

## Usage

First make sure you're using io.js.

> Example:
>
> ```sh
> $ node -v
> v1.5.0
> ```

### Installation

```sh
$ [sudo] npm install -g gyp-io
```

### Start

Make sure you have the permission to listen to port 80.

And close your existing activity port 80 application.

Run the command:

```sh
$ [sudo] gyp-io
```

The service will start and you can use `node-gyp configure` now!

## Principle

I just temporarily modify your `/etc/hosts` that redirecting `nodejs.org` to `127.0.0.1`.

Next step is to start up a small server just redirecting `node-foo.tar.gz` to `iojs.org` and modify some parameters.

After you press `Ctrl + C`, the service will resume your `/etc/hosts` and stop the server.

## Contribute

You're welcome to make pull requests!

「雖然我覺得不怎麼可能有人會關注我」

