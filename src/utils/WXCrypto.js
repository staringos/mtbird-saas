const crypto = require("crypto");
// const debug = require('debug')('wxcrypto');

/**
 * 微信公众号消息加密解密，支持 node > 8.0
 *
 * var WXCrypto = require('this module');
 * var wx = new WXCrypto(token, aesKey, appid);
 *
 * var [err, encryptedXML] = wx.encrypt(xml, timestamp, nonce);
 *
 * var [err, decryptedXML] = wx.decrypt(signature, timestamp, nonce, encrypted);
 *
 *
 * thanks:
 * http://my.oschina.net/u/2324376/blog/397296
 *
 */

class encryptMessage {
  constructor(token, key, appid) {
    this.token = token;
    this.key = key;
    this.appid = appid;
    console.log(
      "wechat crypto class initiaed with token=",
      token,
      "key=",
      key,
      "appid=",
      appid
    );
  }

  //sha1摘要算法
  sha1() {
    let args = Array.prototype.slice.call(arguments);
    args.sort(function (a, b) {
      a = a.toString();
      b = b.toString();
      return a > b ? 1 : a < b ? -1 : 0;
    });
    return crypto.createHash("sha1").update(args.join("")).digest("hex");
  }

  //加密消息
  encrypt(text, timestamp, nonce) {
    var prp = new prpcrypt(this.key);
    var re = prp.encrypt(text, this.appid);
    if (re[0]) return re;
    var encrypted = re[1];
    var hash = this.sha1(this.token, timestamp, nonce, encrypted);

    var xml = `<xml>
<Encrypt><![CDATA[${encrypted}]]></Encrypt>
<MsgSignature><![CDATA[${hash}]]></MsgSignature>
<TimeStamp>${timestamp}</TimeStamp>
<Nonce><![CDATA[${nonce}]]></Nonce>
</xml>`;

    return [false, xml];
  }

  //解密消息
  decrypt(hash, timestamp, nonce, xml) {
    var obj = this.parseWechatXML(xml);
    if (!obj || !obj.Encrypt)
      return [true, "wrong xml format, no Encrypt child"];
    var _hash = this.sha1(this.token, timestamp, nonce, obj.Encrypt);
    if (hash != _hash) return [true, "signature not match"];
    var prp = new prpcrypt(this.key);
    return prp.decrypt(obj.Encrypt, this.appid);
  }

  //解析微信xml
  parseWechatXML(xml) {
    if (!xml || typeof xml != "string") return {};
    var re = {};
    xml = xml.replace(/^<xml>|<\/xml>$/g, "");
    var ms = xml.match(/<([a-z0-9|\_]+)>([\s\S]*?)<\/\1>/gi);
    if (ms && ms.length > 0) {
      ms.forEach((t) => {
        let ms = t.match(/<([a-z0-9|\_]+)>([\s\S]*?)<\/\1>/i);
        let tagName = ms[1];
        let cdata = ms[2] || "";
        cdata = cdata.replace(/^\s*<\!\[CDATA\[\s*|\s*\]\]>\s*$/g, "");
        re[tagName] = cdata;
      });
    }
    return re;
  }
}

class prpcrypt {
  constructor(k) {
    this.key = new Buffer(k + "=", "base64"); //.toString('binary');
    this.mode = "aes-256-cbc";
    this.iv = this.key.toString("hex").slice(0, 16);
  }

  encrypt(text, appid) {
    var text = new Buffer(text),
      pad = this.enclen(text.length);
    var pack = new PKCS7().encode(20 + text.length + appid.length),
      random = this.getRandomStr(),
      content = random + pad + text.toString("binary") + appid + pack;
    try {
      var cipher = crypto.createCipheriv(this.mode, this.key, this.iv);
      cipher.setAutoPadding(false);
      var crypted =
        cipher.update(content, "binary", "base64") + cipher.final("base64");
      return [false, crypted];
    } catch (e) {
      console.error(e);
      return [true, e];
    }
  }

  decrypt(encrypted, appid) {
    var decipher, plain_text;
    try {
      decipher = crypto.Decipheriv(this.mode, this.key, this.iv);
      decipher.setAutoPadding(false);
      plain_text = decipher.update(encrypted, "base64");
      plain_text = Buffer.concat([plain_text, decipher.final()]);
    } catch (e) {
      console.error(e);
      return [true, e];
    }
    var pad = plain_text[plain_text.length - 1];
    if (pad < 1 || pad > 32) pad = 0;
    plain_text = plain_text
      .slice(20, -pad)
      .toString("utf8")
      .replace(/<\/xml>.*/, "</xml>");
    console.log("plain_text=", plain_text);
    return [false, plain_text];
  }

  enclen(len) {
    var buf = new Buffer(4);
    buf.writeUInt32BE(len);
    return buf.toString("binary");
  }

  getRandomStr() {
    var pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
    var re = "";
    for (var i = 0; i < 16; i++) {
      re += pool.charAt(Math.random() * pool.length);
    }
    return re;
  }
}

class PKCS7 {
  constructor() {
    this.block_size = 32;
  }

  encode(text_length) {
    // 计算需要填充的位数
    var amount_to_pad = this.block_size - (text_length % this.block_size);
    if (amount_to_pad === 0) {
      amount_to_pad = this.block_size;
    }

    // 获得补位所用的字符
    var pad = String.fromCharCode(amount_to_pad),
      s = [];
    //console.log('pad:', amount_to_pad, pad);
    for (var i = 0; i < amount_to_pad; i++) s.push(pad);
    return s.join("");
  }
}

module.exports = encryptMessage;
