require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const _ = require('lodash');
const supabaseRoutes = require('./routes/endpoints');

const { createServerClient, parseCookieHeader, serializeCookieHeader } = require('@supabase/ssr')
const { createClient } = require('@supabase/supabase-js')

const allowedOrigins = ['http://localhost:5173', 'http://192.168.1.160:5173', 'https://realtered.onrender.com'];

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

function extractToken(req, res, next) 
{
    //c'est bourrin mais fait chier
    const anonSupabase = createClient(process.env.SUPABASE_CLIENT_URL, process.env.SUPABASE_CLIENT_ANON_SECRET)

    const srvroleSupabase = createServerClient(process.env.SUPABASE_CLIENT_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, 
    {
        cookies: 
        {
            getAll() 
            {
                var cookiz = parseCookieHeader(req.headers.cookie ?? '')
                if(req.headers.token0) 
                {
                    cookiz.push({name: 'sb-fyqptmokmnymednlerpj-auth-token.0', value: req.headers.token0})
                }
                if(req.headers.token1) 
                {
                    cookiz.push({name: 'sb-fyqptmokmnymednlerpj-auth-token.1', value: req.headers.token1})
                }
                return cookiz
            },
            setAll(cookiesToSet) 
            {
                cookiesToSet.forEach(({ name, value, options }) =>
                    res.appendHeader('Set-Cookie', serializeCookieHeader(name, value, options))
                )
            },
        }
    })
    req.anonSupabase = anonSupabase
    req.srvroleSupabase = srvroleSupabase

    next();  // Pass control to the next middleware
}

app.use(express.json());
app.use(cors(corsOptions));
app.use(extractToken);
app.use('/api/supabase', supabaseRoutes); 

const PORT = process.env.API_PORT;

return app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});