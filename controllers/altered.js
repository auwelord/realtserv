const axios = require('axios');
const tools = require('../resources/tools');
const _ = require('lodash');

exports.g_getCardFromApi = (req, res) => tools.traille(() => getCardFromApi (req, res), res)
exports.g_getCardsFromApi = (req, res) => tools.traille(() => getCardsFromApi (req, res), res)
exports.g_getDeckFromApi = (req, res) => tools.traille(() => getDeckFromApi (req, res), res)

async function getDeckFromApi (req, res)
{
    const { data, error} = await axios.get(process.env.ALTERED_DECK_ENDPOINT + req.params.id)
    
    if(error)
        res.status(error.status).send(error);
    else
        res.status(200).json(data)
}

async function getCardFromApi (req, res)
{
    const { data, error } = await axios.get(process.env.ALTERED_CARDS_ENDPOINT + req.params.ref,
    {
        headers: {"Accept-Language": "fr-fr"},
        params: {itemsPerPage: 1, page: 1}
    })
 
    if(error)
        res.status(error.status).send(error);
    else
        res.status(200).json(data)
}

async function getCardsFromApi (req, res)
{
    var headers = {
        "Accept-Language": "fr-fr"
    }

    if(req.headers.authorization)
    {
        headers['Authorization'] = req.headers.authorization
    }
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