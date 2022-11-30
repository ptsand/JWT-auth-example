import jwt from 'jsonwebtoken';
const { createHash } = await import('node:crypto');

let refreshTokens = []; // whitelist

const sha256 = value => createHash("sha3-256").update(value, "utf8").digest("hex");

const accessToken = payload => jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20m' });
const refreshToken = payload => jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

const updateAccessToken = (req, res)=> {
  let { token } = req.body;
  if (!validUserContext(req, token)) return res.sendStatus(401);
  // check refreshToken against whitelist
  if (!refreshTokens.includes(token)) return res.sendStatus(403);
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err !== null) return res.sendStatus(403);
    // delete issued at and expires claims to get a new non expired token
    delete user.iat;
    delete user.exp;
    token = accessToken(user);
    console.log("just issued new access token");
    res.send({ token });
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

// validate user context (avoid side jacking)
const validUserContext = (req, token) => {
  if (!token || !userContext(req)) return false;
  const decoded = jwt.decode(token, { json: true });
  if (decoded.hash !== sha256(userContext(req))) return false;
  return true;
}

const revokeRefreshToken = token => refreshTokens.filter(rt => rt !== token);

export {
  sha256,
  refreshTokens, 
  accessToken, 
  refreshToken, 
  authenticate, 
  updateAccessToken,
  revokeRefreshToken
};