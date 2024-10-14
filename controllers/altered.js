const axios = require('axios');
const _ = require('lodash');
const ogs = require('open-graph-scraper');

exports.g_getCardFromApi = (req, res) => getCardFromApi (req, res)
exports.g_getCardsFromApi = (req, res) => getCardsFromApi (req, res)
exports.g_getDeckFromApi = (req, res) => getDeckFromApi (req, res)
exports.g_getPreviewArticle = (req, res) => getPreviewArticle (req, res)
exports.g_getCardsStats = (req, res) => getCardsStats (req, res)


async function getPreviewArticle (req, res)
{
    const url = req.query.url;

    try 
    {
        const userAgent = 'facebookexternalhit/1.1'
        //'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36';

        const { result } = await ogs(
        { 
            url: url,
            fetchOptions: {
                headers: {
                    'user-agent': userAgent,
                    'Accept-Language': "fr"
                } 
            }
        });
        res.status(200).json(result);
    }
    catch (error) 
    {
        res.status(500).json({ error: 'Failed to fetch URL preview' });
    }
}

async function getDeckFromApi (req, res)
{
    try{
        const { data, error} = await axios.get(process.env.ALTERED_DECK_ENDPOINT + req.params.id)
        
        if(error)
            res.status(error.status).send(error);
        else
            res.status(200).json(data)
    }
    catch(perror)
    {
        res.status(perror.response.status).send(perror.response.data);
    }
}

async function getCardFromApi (req, res)
{
    try{
        const { data, error } = await axios.get(process.env.ALTERED_CARDS_ENDPOINT + req.params.ref,
        {
            params: {itemsPerPage: 1, page: 1, locale: req.body.locale}
        })

        if(error)
            res.status(error.status).send(error);
        else
            res.status(200).json(data)
    }
    catch(perror)
    {
        res.status(perror.response.status).send(perror.response.data);
    }
}

async function getCardsFromApi (req, res)
{
    try{
        var headers = {}

        /*
        if(req.headers.authorization)
        {
            headers['Authorization'] = req.headers.authorization
        }
        */
        const { data, error } = await axios.get(process.env.ALTERED_CARDS_ENDPOINT,
        {
            headers: headers, 
            params: req.body
        })
    
        if(error)
            res.status(error.status).send(error);
        else
            res.status(200).json(data)
    }
    catch(perror)
    {
        res.status(perror.response.status).send(perror.response.data);
    }
}

async function getCardsStats (req, res)
{
    const cards = req.body
    
    try{
        const apiparams = {reference: []}
        cards.forEach(pcard => apiparams.reference.push(pcard.reference))

        const { data, error } = await axios.get(process.env.ALTERED_STATS_ENDPOINT,
        {
            headers: {'Authorization': req.headers.authorization}, 
            params: apiparams
        })
    
        if(error)
            res.status(error.status).send(error);
        else
            res.status(200).json(data)
    }
    catch(perror)
    {
        console.error(perror.response.data)
        res.status(perror.response.status).send(perror.response.data);
    }
}