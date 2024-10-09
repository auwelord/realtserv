
require('dotenv').config()
const _ = require('lodash');
const tools = require('../resources/tools');

//user/admin
exports.g_isAdmin = (req, res) => tools.traille(() => isAdmin (req, res), res)

//image/s3
exports.g_updateImageS3 = (req, res) => tools.traille(() => updateImageS3 (req, res), res)
//image/s3/upload
exports.g_uploadImage = (req, res) => tools.traille(() => uploadImage (req, res), res)

//deck/saveprops
exports.g_saveProperties = (req, res) => tools.traille(() => saveProperties (req, res), res)
//deck/update
exports.g_updateDeck = (req, res) => tools.traille(() => updateDeck (req, res), res)
//deck/new
exports.g_newDeck = (req, res) => tools.traille(() => newDeck (req, res), res)
//deck/newversion
exports.g_createDeckVersion = (req, res) => tools.traille(() => createDeckVersion (req, res), res)
//deck/deleteversion
exports.g_deleteDeckVersion = (req, res) => tools.traille(() => deleteDeckVersion (req, res), res)
//deck/save
exports.g_saveDeck = (req, res) => tools.traille(() => saveDeck (req, res), res)
//deck/delete/:id
exports.g_deleteDeck = (req, res) => tools.traille(() => deleteDeck (req, res), res)
//deck/favori/:id
exports.g_toggleDeckFavori = (req, res) => tools.traille(() => toggleDeckFavori (req, res), res)

//card/update
exports.g_updateCard = (req, res) => tools.traille(() => updateCard (req, res), res)
//card/favori/:ref
exports.g_toggleCardFavori = (req, res) => tools.traille(() => toggleCardFavori (req, res), res)
//card/addfavori/:ref
exports.g_addCardFavori = (req, res) => tools.traille(() => addCardFavori (req, res), res)

//cardsdeck/set
exports.g_setCardsDeck = (req, res) => tools.traille(() => setCardsDeck (req, res), res)

//tournoi/save
exports.g_saveTournoi = (req, res) => tools.traille(() => saveTournoi (req, res), res)

async function saveTournoi (req, res)
{

    var ptournoi = req.body

    var {data: dataTournoi, error: errorTournoi} = await req.srvroleSupabase
        .from('Tournoi')
        .upsert(ptournoi)
        .select()

    if(errorTournoi)
        res.status(errorTournoi.status ? errorTournoi.status : 500).send(errorTournoi);
    else
        res.status(200).json({tournoi: dataTournoi[0]})
}

async function isAdmin (req, res)
{
    const { data } = await req.srvroleSupabase.auth.getUser()
    const admin = data && data.user && data.user.id == process.env.SUPABASE_ADMINID

    res.status(200).json({isadmin: admin});
}

async function addCardFavori (req, res)
{
    const reference = req.params.ref;
    var favori = false

    const { data } = await req.srvroleSupabase.auth.getUser()

    if(data.user)
    {
        const { data, error } = await req.srvroleSupabase
            .from('UniqueFav')
            .upsert({reference: reference})
            .select()

        if(error) console.error(error)

        favori = data && data.length > 0 && !error
    }
    res.status(200).json({favori: favori})
}

async function toggleCardFavori (req, res)
{
    const reference = req.params.ref;
    var favori = false

    const { data } = await req.srvroleSupabase.auth.getUser()

    if(data.user)
    {
        const data1 = await req.anonSupabase
            .from('UniqueFav')
            .select()
            .eq('userId', data.user.id)
            .eq('reference', reference)

        if(data1.data && data1.data.length > 0)
        {
            //remove from database
            const data2 = await req.srvroleSupabase
                .from('UniqueFav')
                .delete()
                .eq('userId', data.user.id)
                .eq('reference', reference)
        }
        else{
            const data3 = await req.srvroleSupabase
                .from('UniqueFav')
                .insert({reference: reference})
                
            favori = !data3.error
        }
    }
    res.status(200).json({favori: favori})
}

async function toggleDeckFavori (req, res)
{
    const id = req.params.id;
    var favori = false

    const { data } = await req.srvroleSupabase.auth.getUser()

    if(data.user)
    {
        const data1 = await req.anonSupabase
            .from('DeckFav')
            .select()
            .eq('userId', data.user.id)
            .eq('deckId', id)

        if(data1.data && data1.data.length > 0)
        {
            //remove from database
            const data2 = await req.srvroleSupabase
                .from('DeckFav')
                .delete()
                .eq('userId', data.user.id)
                .eq('deckId', id)
        }
        else{
            const data3 = await req.srvroleSupabase
                .from('DeckFav')
                .insert({deckId: id})
                
            favori = !data3.error
        }
    }
    res.status(200).json({favori: favori})
}

async function deleteDeck (req, res)
{
    const id = req.params.id;

    //suppression de tous les deck versions
    const { error: errorvrs } = await req.srvroleSupabase
        .from('Deck')
        .delete()
        .eq('refid', id);

    if(errorvrs)
    {
        res.status(errorvrs.status ? errorvrs.status : 500).send(errorvrs);
        return
    }

    const { data, error } = await req.srvroleSupabase
        .from('Deck')
        .delete()
        .eq('id', id);
    
    if(error)
        res.status(error.status ? error.status : 500).send(error);
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
        res.status(error.status ? error.status : 500).send(error);
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
    {
        res.status(error.status ? error.status : 500).send(error);
    }
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
        res.status(error.status ? error.status : 500).send(error);
    else
        res.status(200).json(data[0])
        
}

async function updateCard (req, res)
{
    const card = req.body;

    if(card.locale == 'en')
    {
        const cardtrad = {
            reference: card.reference,
            locale: card.locale,
            name: card.name,
            imagePath: card.imagePath,
            main_effect: card.main_effect,
            reserve_effect: card.reserve_effect,
            static_effect: card.static_effect,
            echo_effect: card.echo_effect,
            etb_effect: card.etb_effect,
            hand_effect: card.hand_effect,
            exhaust_effect: card.exhaust_effect,
        }
    
        const {data: tradcard, error} = await req.srvroleSupabase
            .from('CardTrad')
            .upsert([cardtrad])
            .select();

        const {data: maincard, error: errorcard} = await req.srvroleSupabase
            .from('Card')
            .select()
            .eq('reference', card.reference);

        if(error)
            res.status(error.status ? error.status : 500).send(error);
        else
        {
            var finalcard = maincard[0]
            finalcard.name = tradcard[0].name
            finalcard.imagePath = tradcard[0].imagePath
            finalcard.main_effect = tradcard[0].main_effect
            finalcard.reserve_effect = tradcard[0].reserve_effect
            finalcard.static_effect = tradcard[0].static_effect
            finalcard.echo_effect = tradcard[0].echo_effect
            finalcard.etb_effect = tradcard[0].etb_effect
            finalcard.hand_effect = tradcard[0].hand_effect
            finalcard.exhaust_effect = tradcard[0].exhaust_effect

            res.status(200).json(finalcard)
        }
        return
    }
    
    delete card.locale

    const {data, error} = await req.srvroleSupabase
        .from('Card')
        .upsert([card])
        .select();

    if(error)
        res.status(error.status ? error.status : 500).send(error);
    else
        res.status(200).json(data[0])
}

async function deleteDeckVersion (req, res)
{
    const pdeck = req.body;
    const refid = pdeck.refid

    const { data, error } = await req.srvroleSupabase
        .from('Deck')
        .delete()
        .eq('id', pdeck.id);

    //récupération de la dernière version
    const {data: vrsdecks} = await req.anonSupabase
        .from('Deck')
        .select()
        .eq('refid', refid)
        .order('version', { ascending: false })
        .limit(1)

    if(error)
        res.status(error.status ? error.status : 500).send(error);
    else
        res.status(200).json(vrsdecks.version)
}

async function createDeckVersion (req, res)
{
    const pdeck = req.body;
    
    
    var newdeck = {
        name: pdeck.name,
        refid: pdeck.refid > 0 ? pdeck.refid : pdeck.id,
        description: pdeck.description,
        hero_id: pdeck.hero_id,
        main_faction: pdeck.main_faction,
        public: pdeck.public,
        valide: pdeck.valide,
    }
    
    //recup de la version
    const {data} = await req.anonSupabase
        .from('Deck')
        .select()
        .eq('refid', newdeck.refid)
        .order('version', { ascending: false })
        .limit(1)

    newdeck.version = (data && data.length > 0 ? data[0].version : 1) + 1

    var {data: datadeck, error} = await req.srvroleSupabase
        .from('Deck')
        .upsert(newdeck)
        .select()

    if(error)
    {
        res.status(error.status ? error.status : 500).send(error);
        return
    }

    newdeck = datadeck[0]

    var cards = [];
    pdeck.cards.forEach(card => {
        cards.push({
            cardRef: card.reference,
            deckId:  newdeck.id,
            quantity: card.quantite
        });
    });
    await req.srvroleSupabase
        .from('CardsDeck')
        .insert(cards)
        .select();
    
    res.status(200).json(newdeck)
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
        res.status(error.status ? error.status : 500).send(error);
    else
        res.status(200).json(data[0])        
}

async function saveDeck (req, res)
{
    var pdeck = req.body.deck

    var deck = {
        id: pdeck.id,
        name: pdeck.name,
        description: pdeck.description,
        hero_id: pdeck.hero_id,
        main_faction: pdeck.main_faction,
        public: pdeck.public,
        valide: pdeck.valide != undefined && pdeck.valide,
        modifiedAt: new Date().toISOString(),
        tournoiId: pdeck.tournoiId,
        tournoiPos: pdeck.tournoiPos,
    }
    if(pdeck.id > 0)
    {
        deck.userId = pdeck.tournoiId > 0 ? null : pdeck.userId
        deck.version = pdeck.version
    } 
    else
    {
        if(pdeck.tournoiId > 0) deck.userId = null
        delete deck.id
    } 

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
            pdeck.cards.forEach(card => {
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
    if(req.body.locale == 'fr')
    {
        const { data: card, error } = await req.srvroleSupabase
            .from('Card')
            .upsert({
                reference: req.body.card.reference,
                imageS3: req.body.path
            })
            .select();

        if(error)
            res.status(error.status ? error.status : 500).send(error);
        else
            res.status(200).json(card[0])
    }
    else
    {
        const { data: cardtrad, error: errortrad } = await req.srvroleSupabase
            .from('CardTrad')
            .upsert({
                reference: req.body.card.reference,
                locale: req.body.locale,
                imageS3: req.body.path
            })
            .select()

        if(errortrad)
        {
            res.status(errortrad.status ? errortrad.status : 500).send(errortrad);
            return 
        }

        const { data: card, error } = await req.anonSupabase
            .from('Card')
            .select()
            .eq('reference', req.body.card.reference);

        if(error)
        {
            res.status(error.status ? error.status : 500).send(error);
            return
        }

        var finalcard = card[0]
        finalcard.name = cardtrad[0].name
        finalcard.imagePath = cardtrad[0].imagePath
        finalcard.main_effect = cardtrad[0].main_effect
        finalcard.reserve_effect = cardtrad[0].reserve_effect
        finalcard.static_effect = cardtrad[0].static_effect
        finalcard.echo_effect = cardtrad[0].echo_effect
        finalcard.etb_effect = cardtrad[0].etb_effect
        finalcard.hand_effect = cardtrad[0].hand_effect
        finalcard.exhaust_effect = cardtrad[0].exhaust_effect

        res.status(200).json(finalcard)
    }
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
        res.status(error.status ? error.status : 500).send(error);
    else
        res.status(200).json(data)
}
