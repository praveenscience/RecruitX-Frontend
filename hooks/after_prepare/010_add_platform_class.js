#!/usr/bin/env node

// Add Platform Class
// v1.0
// Automatically adds the platform class to the body tag
// after the `prepare` command. By placing the platform CSS classes
// directly in the HTML built for the platform, it speeds up
// rendering the correct layout/style for the specific platform
// instead of waiting for the JS to figure out the correct classes.

var fs = require('fs'),
  path = require('path'),
  rootdir = process.argv[2],
  findBodyTag = function (html) {
    'use strict';

    // get the body tag
    try {
      return html.match(/<body(?=[\s>])(.*?)>/gi)[0];
    } catch (e) {}
  },
  findClassAttr = function (bodyTag) {
    'use strict';

    // get the body tag's class attribute
    try {
      return bodyTag.match(/ class=["|'](.*?)["|']/gi)[0];
    } catch (e) {}
  },
  addPlatformBodyTag = function (indexPath, platform) {
    'use strict';

    // add the platform class to the body tag
    try {
      var platformClass = 'platform-' + platform;
      var cordovaClass = 'platform-cordova platform-webview';

      var html = fs.readFileSync(indexPath, 'utf8');

      var bodyTag = findBodyTag(html);
      if (!bodyTag) {
        return; // no opening body tag, something's wrong
      }

      if (bodyTag.indexOf(platformClass) > -1) {
        return; // already added
      }

      var newBodyTag = bodyTag;

      var classAttr = findClassAttr(bodyTag);
      if (classAttr) {
        // body tag has existing class attribute, add the classname
        var endingQuote = classAttr.substring(classAttr.length - 1);
        var newClassAttr = classAttr.substring(0, classAttr.length - 1);
        newClassAttr += ' ' + platformClass + ' ' + cordovaClass + endingQuote;
        newBodyTag = bodyTag.replace(classAttr, newClassAttr);

      } else {
        // add class attribute to the body tag
        newBodyTag = bodyTag.replace('>', ' class="' + platformClass + ' ' + cordovaClass + '">');
      }

      html = html.replace(bodyTag, newBodyTag);

      fs.writeFileSync(indexPath, html, 'utf8');

      process.stdout.write('add to body class: ' + platformClass + '\n');
    } catch (e) {
      process.stdout.write(e);
    }
  };

if (rootdir) {
  // go through each of the platform directories that have been prepared
  var platforms = (process.env.CORDOVA_PLATFORMS ? process.env.CORDOVA_PLATFORMS.split(',') : []);

  for (var x = 0; x < platforms.length; x++) {
    // open up the index.html file at the www root
    try {
      var platform = platforms[x].trim().toLowerCase();
      var indexPath;

      if (platform === 'android') {
        indexPath = path.join('platforms', platform, 'assets', 'www', 'index.html');
      } else {
        indexPath = path.join('platforms', platform, 'www', 'index.html');
      }

      if (fs.existsSync(indexPath)) {
        addPlatformBodyTag(indexPath, platform);
      }
    } catch (e) {
      process.stdout.write(e);
    }
  }
}
