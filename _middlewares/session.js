import {DEBUG} from '../helpers.js';
import {COOKIE_NAME, NOUSER_ID, blankPerms, _getTable, SESSION_TABLE} from '../db_helpers.js';

  export function getSession(req, res, next) {
    const {[COOKIE_NAME]:cookie} = req.cookies;
    const {Authorization:authHeader} = req.headers;
    const noSessionClaim = ! cookie && ! authHeader;
    const redundantClaim = cookie && authHeader;

    let token;
    let session;

    let tokenIsInvalid;
    let sessionIsExpired;
    
    switch(true) {
      case noSessionClaim:
        DEBUG.INFO && console.warn("No session claim");
        break;
      case redundantClaim:
        DEBUG.WARN && console.warn("Both cookie and header used for session. Invalid.");
        res.abort(400);
        break;
      case !!cookie:
        token = cookie;
        break;
      case !!authHeader: 
        token = authHeader;
        token = token.replace("Bearer ", "");
        break;
      default:
        // No need as the 4 possible cases are above
        throw "This should never happen"
    }

    if ( token ) {
      const sessions = _getTable(SESSION_TABLE);

      try {
        session = sessions.get(token);
      } catch(e) {
        DEBUG.WARN && console.warn({msg:"Token is invalid because there is no session associated with it", token, error:e});
        tokenIsInvalid = true;
      }

      if ( ! tokenIsInvalid ) {
        if ( session.expiresAt >= Date.now() ) {
          DEBUG.WARN && console.warn({msg:"Expired session", token, session});
          sessionIsExpired = true;
        }
      }
    } else if ( noSessionClaim ) {
      session = {userid:NOUSER_ID};
    }

    const authorization = {
      token, 
      session, 
      noSessionClaim,
      tokenIsInvalid,
      sessionIsExpired,
      // as an object, 'permissions' properties are *not* frozen
      permissions: blankPerms()
    };

    Object.freeze(authorization);
    Object.defineProperty(req, 'authorization', { get: () => authorization, enumerable: true });

    DEBUG.INFO && console.log({authorization});

    console.log({
      path: req.path,
      authorization
    });

    next();
  }

