
require('dotenv').config()
const _ = require('lodash');
const axios = require('axios');

function traille (fct)
{
    try
    {
        fct()
    }
    catch (error) 
    {
        res.status(error.status).send(error);
    }
}

exports.g_isAdmin = (req, res) => traille(() => isAdmin (req, res))
exports.g_saveProperties = (req, res) => traille(() => saveProperties (req, res))
exports.g_saveDeck = (req, res) => saveDeck (req, res)
exports.g_updateDeck = (req, res) => updateDeck (req, res)
exports.g_updateImageS3 = (req, res) => traille(() => updateImageS3 (req, res))
exports.g_uploadImage = (req, res) => traille(() => uploadImage (req, res))
exports.g_updateCard = (req, res) => traille(() => updateCard (req, res))
exports.g_getCardFromApi = (req, res) => traille(() => getCardFromApi (req, res))
exports.g_newDeck = (req, res) => newDeck (req, res)
exports.g_setCardsDeck = (req, res) => setCardsDeck (req, res)
exports.g_deleteDeck = (req, res) => deleteDeck (req, res)

async function isAdmin (req, res)
{
    const userId = req.params.id;

    res.status(200).json({isadmin: userId == process.env.SUPABASE_ADMINID});
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

async function deleteDeck (req, res)
{
    const id = req.params.id;

    const { data, error } = await req.srvroleSupabase
        .from('Deck')
        .delete()
        .eq('id', id);

    if(error)
        res.status(error.status).send(error);
    else
        res.status(200).json(data)
}

async function setCardsDeck (req, res)
{
    const cards = req.body;

    const {data, error} = await req.srvroleSupabase
        .from('CardsDeck')
        .insert(cards);

    if(error)
        res.status(error.status).send(error);
    else
        res.status(200).json({})
        
}

async function newDeck (req, res)
{
    const deck = req.body;

    const {data, error} = await req.srvroleSupabase
        .from('Deck')
        .insert(deck)
        .select();

    if(error)
        res.status(error.status).send(error);
    else
        res.status(200).json(data[0])
        
}

async function updateDeck (req, res)
{
    const deck = req.body;

    deck.modifiedAt = new Date().toISOString()

    const {data, error} = await req.srvroleSupabase
        .from('Deck')
        .update(deck)
        .eq('id', deck.id)
        .select();

    if(error)
        res.status(error.status).send(error);
    else
        res.status(200).json(data[0])
        
}

async function updateCard (req, res)
{
    const card = req.body;

    const {data, error} = await req.srvroleSupabase
        .from('Card')
        .upsert([card])
        .select();

    if(error)
        res.status(error.status).send(error);
    else
        res.status(200).json(data[0])
}

async function saveProperties (req, res)
{
    const pdeck = req.body;

    //on garde que les données utiles
    const deck = {
        name: pdeck.name,
        description: pdeck.description,
        public: pdeck.public,
        modifiedAt: new Date().toISOString()
    }

    const {data, error} = await req.srvroleSupabase
        .from('Deck')
        .update(deck)
        .select()
        .eq('id', pdeck.id);

    if(error)
        res.status(error.status).send(error);
    else
        res.status(200).json(data[0])        
}

async function saveDeck (req, res)
{
    var deck = _.merge({}, req.body.deck)
    delete deck.cards
    delete deck.hero
    if(deck.id == 0) delete deck.id

    deck.modifiedAt = new Date().toISOString()

    var {data: dataDeck, error: errorDeck} = await req.srvroleSupabase
        .from('Deck')
        .upsert(deck)
        .select()
    
    if(errorDeck) console.error(errorDeck)

    var zedeck = errorDeck ? null : dataDeck[0];
    if(zedeck)
    {
        //suppression des cartes du deck
        var {error: errorCardsDeck} = await req.srvroleSupabase
            .from('CardsDeck')
            .delete()
            .eq('deckId', zedeck.id)

        if(!errorCardsDeck)
        {
            //enregistrements des cartes
            var cards = [];
            req.body.deck.cards.forEach(card => {
                cards.push({
                    cardRef: card.reference,
                    deckId:  zedeck.id,
                    quantity: card.quantite
                });
            });
            await req.srvroleSupabase
                .from('CardsDeck')
                .insert(cards)
                .select();
        }
    }

    if(zedeck)
        res.status(200).json(zedeck)
    else
        res.status(500).send({message: 'Erreur lors de la sauvegarde du deck'});
}

async function updateImageS3 (req, res)
{
    const { data: card, error } = await req.srvroleSupabase
        .from('Card')
        .upsert({
            reference: req.body.card.reference,
            imageS3: req.body.path
        })
        .select();

    if(error)
        res.status(error.status).send(error);
    else
        res.status(200).json(card[0])
}

async function uploadImage (req, res)
{
    const fileBuffer = req.file.buffer;
    const blob = new Blob([fileBuffer], { type: "image/webp" });

    const { data, error } = await req.srvroleSupabase.storage
        .from(`${process.env.ALTERED_BUCKET_NAME}`)
        .upload(req.body.path, blob,
        {
            cacheControl: '3600',
            upsert: true,
            contentType: 'image/webp',
        });

    if(error)
        res.status(error.status).send(error);
    else
        res.status(200).json(data)
}
