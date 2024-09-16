const traille = function(fct, res)
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

module.exports = {
    traille
}