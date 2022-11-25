import jwt from 'jsonwebtoken';
const { createHash } = await import('node:crypto');

let refreshTokens = [];

const sha256 = value => createHash("sha256").update(value, "utf8").digest("hex");

const signAccessToken = payload => jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5s' });
const signRefreshToken = payload => jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '20s' });

const updateAccessToken = (req, res)=>{
  const { refreshToken } = req.body;
  if (!validUserContext(req, refreshToken)) return res.sendStatus(401);
  // check refreshToken against whitelist
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err !== null) return res.sendStatus(403);
    // delete issued at and expires claims to get a new non expired token
    delete user.iat;
    delete user.exp;
    // console.log("claims extracted, user:", user);
    let accessToken = signAccessToken(user);
    console.log("new token:", accessToken);
    res.send({ accessToken });
  });
}

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!validUserContext(req, token)) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err !== null) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

const userContext = req => req.cookies.__Secure_Fgp;
// validate user context to avoid side jacking
const validUserContext = (req, token) => {
  // console.log(token, userContext(req));
  if (!token || !userContext(req)) return false;
  let decoded = jwt.decode(token, { json: true });
  console.log("decoded:", decoded, "token:", JSON.stringify(token));
  if (decoded.hash !== sha256(userContext(req))) return false;
  return true;
}

const revokeRefreshToken = token => refreshTokens = refreshTokens.filter(rt => rt !== token);

export {
  sha256,
  refreshTokens, 
  signAccessToken, 
  signRefreshToken, 
  authenticate, 
  updateAccessToken,
  revokeRefreshToken
};