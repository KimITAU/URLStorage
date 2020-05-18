/**
 * This script is to enable a programmer to write and fetch data from the Query String for a web page.
 * The data is encoded in base64 to hide values from the user
 */
function gtmIRXFunction() {
    'use strict';

    var gtmParamName = 'gtmParams'; // parameter name in Query String
    var gtmDomain = window.location.hostname; // current domain

    //Default storage object
    var defaultgtmParamsObject = 
    { sites:[
        {
            domain: gtmDomain,
            params: {}
        }
    ]};

    /* ========================  FUNCTIONS   ======================== */ 

    /**
     * Returns an encoded serialised version of a JSON object
     * @param JSON JSONObject 
     */
    function encodeGTMForULR(JSONObject){
        return encodeURI(btoa(JSON.stringify(JSONObject)));
    }
    /**
     * returns a deserialised JSON version of a string 
     * @param string gtmString 
     */
    function decodeGTMForULR(gtmString){
        try{
            return JSON.parse(atob(decodeURI(gtmString)));
        }catch(err){
            return undefined;
        }
    }

    /**
     * 
     * Retrieves a query string parameter by name from a url
     * @param string url 
     * @param string name 
     */
    function getParameterByName(url, name) {
        if (!url) url = window.location.href;
        name = !!name ? name : '';
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

   
    /**
     * retrieve the gtm hash parament for the document
     */
    function getGTMParam(){
        var result = undefined;
        try{
            result = decodeGTMForULR(getParameterByName(window.location.href, gtmParamName));
        }catch(err){
        }
        return result;
    }  

    /**
     * 
     * Find current site parameters and return the index 
     * @param {} gtmParamObject 
     */
    function getCurrentDomainIndex(gtmParamObject){
        var hostname = window.location.hostname;
        if ( !!gtmParamObject && !!gtmParamObject.sites ){

            for(let i = 0; i < gtmParamObject.sites.length; i++){
                if(gtmParamObject.sites[i].domain === hostname) {
                    return i;
                }
            }
        }
        return false;
    }

    /**
     * Public facing function. 
     * Returns parameters for current domain
     */
    function getSiteParameters(){
        var gtmParamObject = getGTMParam(window.location.search, gtmParamName);
        var siteIndex = getCurrentDomainIndex(gtmParamObject);
        if(siteIndex!==false){
            return gtmParamObject.sites[siteIndex].params
        }
        //default value
        return {}
    }
    
    /**
     * Public facing function
     * Sets parameters for current domain
     * 
     * @param {} gtmParamValue //TODO - make this an 'update' object rather than an 'overwrite' object. i.e. object will only contain updates, rather than all parameters
     */
    function setSiteParameters(gtmParamValue){
        var gtmParamsObject = getGTMParam(window.location.search, gtmParamName) || defaultgtmParamsObject;
        var siteIndex = getCurrentDomainIndex(gtmParamsObject);
        if(siteIndex!==false && !!gtmParamsObject && gtmParamsObject.sites && gtmParamsObject.sites[siteIndex]){
            gtmParamsObject.sites[siteIndex].params = gtmParamValue;
        } 

        gtmParamValue = encodeGTMForULR(gtmParamsObject);

        var qsValues = window.location.search;
        if (!qsValues || qsValues.search(gtmParamName) === -1 ) {
            var newQsValues = (!qsValues ? '?' : qsValues + '&' ) + gtmParamName + '=' + gtmParamValue;
        } else {
            var oldgtmParam = encodeGTMForULR(getGTMParam(window.location.href, gtmParamName));
            var newQsValues = qsValues.replace(gtmParamName + '=' + oldgtmParam, gtmParamName + '=' + gtmParamValue);
        }
        
        window.history.replaceState(
            {}
            , ''
            , newQsValues);

    }

    /* ========================  END FUNCTIONS   ======================== */ 


    window.onbeforeunload = function(ev) {
        console.log(ev);
        if(document.activeElement.href ){
            //add params to href
            //window.location.href = "http://google.com";
            document.activeElement.href += '?bob=adsflkjadsf';
            //return false;
        }
    };

    //make these functions "public"
    return {
        setSiteParameters : setSiteParameters,
        getSiteParameters : getSiteParameters
    }

};

var gtmIRXUtils = gtmIRXFunction();
