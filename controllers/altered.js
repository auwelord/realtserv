const axios = require('axios');
const _ = require('lodash');

exports.g_getCardFromApi = (req, res) => getCardFromApi (req, res)
exports.g_getCardsFromApi = (req, res) => getCardsFromApi (req, res)
exports.g_getDeckFromApi = (req, res) => getDeckFromApi (req, res)

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
            headers: {"Accept-Language": "fr-fr"},
            params: {itemsPerPage: 1, page: 1}
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
    catch(perror)
    {
        res.status(perror.response.status).send(perror.response.data);
    }
}