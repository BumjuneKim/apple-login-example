const express = require('express');
const http = require('http');
const passport = require('passport');
const AppleStrategy = require('passport-apple');
const app = express();
require('dotenv').config()

initPassport()
  .then(() => {
    listenPort();
    setRouting();
  })

async function initPassport() {
  /**
   privateKeyLocation은 key파일의 경로이고
   privateKeyString은 key파일의 내용이다. 둘중에 하나를 파라미터로 Strategy에 넘겨줘야 한다.

   callbackURL은 인증결과 수신 URL이다
  **/
  const appleStrategyOpt = {
    clientID: process.env.CLIENT_ID,
    teamID: process.env.TEAM_ID,
    callbackURL: `https://www.kbjtown.com/api/auth/apple/callback`,
    keyID: process.env.KEY_ID,
    privateKeyLocation: './AuthKey_WM66Y023YU.p8',
    // privateKeyString: '-----BEGIN PRIVATE KEY-----\n' +
    //   'MIGTAgEAMBMGByqGS*******CCqGSM49AwEHBHkwdwIBAQQgQAetDdWp5C1nYUnG\n' +
    //   'ZaygNzLXimFD*********lNt****CgYIKoZIzj0DAQehRANCAARPTlBY9eHN38qr\n' +
    //   'UlDXLy2w+vzJVBrifnNyJDgf0O3+********7zjOmNXUomKcj7eoqVS0gPtNcm2B\n' +
    //   'CQe*****\n' +
    //   '-----END PRIVATE KEY-----\n'
  };

  passport.use(new AppleStrategy(appleStrategyOpt, (req, accessToken, refreshToken, decodedIdToken, profile, cb) => {
    /**
     decodedIdToken이 우리가 필요로 하는 값이며 내용은 다음과 같다.
     sub property가 user를 구분할 수 있는 id의 개념

     (예시임)
      {
        iss: 'https://appleid.apple.com',
        aud: 'com.kbj.service',
        exp: 1594719261,
        iat: 1594718661,
        sub: '000328.*********&c64db99xxxxxxxxxxa2bc0.****',
        at_hash: '8BuoxxxxxxxxxxEUzrCKAw',
        email: 'kbj@kbjtown.com',
        email_verified: 'true',
        auth_time: 1594718660,
        nonce_supported: true
      }
     **/

    process.nextTick(() => cb(null, decodedIdToken));
  }));
}

function listenPort() {
  const port = process.env.PORT || 3200;
  http.createServer(app).listen(port, '0.0.0.0', () => {
    console.log(`server listening on port ${port}!`);
  });
}

function setRouting() {
  app.get('/apple-login', passport.authenticate('apple'));

  app.post('/api/auth/apple/callback', (req, res, next) => {
    passport.authenticate('apple', (err, profile) => {
      /**
       * profile 변수에는 AppleStrategy callback에서 넘겨주는 decodedIdToken의 값이 담긴다.
       */
      req.profile = profile;
      next();
    })(req, res, next);
  });
}

