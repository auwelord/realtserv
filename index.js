require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const _ = require('lodash');
const supabaseRoutes = require('./routes/supabase');

const { createServerClient, parseCookieHeader, serializeCookieHeader } = require('@supabase/ssr')
const { createClient } = require('@supabase/supabase-js')

const allowedOrigins = ['http://localhost:5173', 'http://192.168.1.160:5173', 'https://realtered.onrender.com/'];

const corsOptions = 
{
    origin: function (origin, callback) 
    {
        // Check if the request's origin is in the allowedOrigins array
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) 
        {
            callback(null, true);
        }
        else
        {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,  // Enable credentials (cookies)
}

function getAccessToken(req)
{
    parseCookieHeader(req.headers.cookie ?? '').forEach(cookie => {
        if(cookie.name == 'sb-fyqptmokmnymednlerpj-auth-token')
        {
            console.log('Bearer ' + JSON.parse(cookie.value).access_token)
            return 'Bearer ' + JSON.parse(cookie.value).access_token
        }
    })
    return ''
    
    //'Bearer ' + parseCookieHeader(req.headers.cookie ?? '').access_token
}
function extractToken(req, res, next) 
{
    //const authHeader = req.headers['authorization'];
  
    //if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extract the token from the "Bearer" string
      //const accessToken = authHeader.split(' ')[1];  // Get the token part
      //req.token = token;  // Attach token to request object
        //if(!accessToken) res.status(401).send('Authorization header missing or invalid')
        //else
        //{
            //c'est bourrin mais fait chier
            const anonSupabase = createClient(process.env.SUPABASE_CLIENT_URL, process.env.SUPABASE_CLIENT_ANON_SECRET)

            const srvroleSupabase = createServerClient(process.env.SUPABASE_CLIENT_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, 
            {
                /*
                global: {
                    headers: {
                      Authorization: getAccessToken(req),
                    },
                },*/
                cookies: {
                    getAll() {
                        return parseCookieHeader(req.headers.cookie ?? '')
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            res.appendHeader('Set-Cookie', serializeCookieHeader(name, value, options))
                        )
                    },
                }
            })
            req.anonSupabase = anonSupabase
            req.srvroleSupabase = srvroleSupabase
        //}        

      next();  // Pass control to the next middleware
      /*
    } else {
      res.status(401).send('Authorization header missing or invalid');
    }
      */
}
app.use(express.json());
app.use(cors(corsOptions));
app.use(extractToken);
app.use('/api/supabase', supabaseRoutes); 

const PORT = process.env.API_PORT;

return app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});