

two31=Math.pow(2,31);  intMax=two31-1;  intMin=-two31;
sPerDay=24*3600;  sPerMonth=sPerDay*30;

fsWebRootFolder=process.cwd();
flLibFolder='lib';

flFoundOnTheInternetFolder=flLibFolder+"/foundOnTheInternet";
flLibImageFolder=flLibFolder+"/image";  

  // Files: 
leafBE='be.json';
//leafPageLoadBE='pageloadbe.json';
//leafSiteSpecific='siteSpecific.js';
leafCommon='common.js';


StrImageExt=['jpg','jpeg','png','gif','svg'];


messPreventBecauseOfNewerVersions="Preventing overwrite since there are newer versions. Copy your edits temporary, then reload page.";

version='100';
maxGroupsInFeat=20;
preDefault="p.";


selTimeF=function(name){  return "UNIX_TIMESTAMP("+name+")";  };

    //    0        1
bName=['block','help'];    // block: block(or span in) vendorInfo
bFlip=array_flip(bName);

var tFeat={kind:'S11',min:[0, 0.25, 1, 3, 8, 24, 72, 168, 3*168, 8760/4, 8760, 3*8760], bucketLabel:['0', '¼h', '1h', '3h', '8h', '1d', '3d', '1w', '3w', '¼y', '1y', '3y']};
for(var i=0;i<tFeat.min.length;i++) tFeat.min[i]*=3600; // make hours to seconds

var sizePageFeat={kind:'S11',min:[0, 0.1, 0.3, 1, 3, 10, 30, 100], bucketLabel:['0', '100', '300', '1k', '3k', '10k', '30k', '100k']};
var sizeImageFeat={kind:'S11',min:[0, 0.1, 0.3, 1, 3, 10, 30, 100, 300, 1000, 3000], bucketLabel:['0', '100', '300', '1k', '3k', '10k', '30k', '100k', '300k', '1M', '3M']};
for(var i=0;i<sizePageFeat.min.length;i++) sizePageFeat.min[i]*=1000; // make kB to B
for(var i=0;i<sizeImageFeat.min.length;i++) sizeImageFeat.min[i]*=1000; // make kB to B

//name:                {b:'00'}, lastRev:             {b:'00'}, idPage:              {b:'00'}, idFile:              {b:'00'},
 
                    //   01
PropPage={
//parentSite:          {b:'11',feat:{kind:'B'}},
parent:              {b:'11',feat:{kind:'B'}},
siteName:            {b:'10',feat:{kind:'B'}},
size:                {b:'11',feat:sizePageFeat},
boOR:                {b:'01',feat:{kind:'BN',span:1}},
boOW:                {b:'01',feat:{kind:'BN',span:1}},
boSiteMap:           {b:'01',feat:{kind:'BN',span:1}},
boTalk:              {b:'01',feat:{kind:'BN',span:1}},
boTemplate:          {b:'01',feat:{kind:'BN',span:1}},
boOther:             {b:'01',feat:{kind:'BN',span:1}},
tCreated:            {b:'11',feat:tFeat},
tMod:                {b:'11',feat:tFeat},
tModCache:           {b:'11',feat:tFeat}
};
StrOrderFiltPage=Object.keys(PropPage);

extend(PropPage,{
pageName:            {b:'00'},
lastRev:             {b:'00'},
idPage:              {b:'00'},
idFile:              {b:'00'},
nChild:              {b:'00'},
nImage:              {b:'00'},
nParent:             {b:'00'},
www:                 {b:'00'}});


  // Note! cond0F and cond1F uses whole (like "p.tMod" (tableName+'.'+columnName)) as name whether all others uses only "tMod"
  // Either I should supply the tableName separately (like in the neo4j-version), or all other methods (condBNameF...) should use the whole (long) version of the name.

tmpCond0F=function(name, val){  return "UNIX_TIMESTAMP("+name+")<=UNIX_TIMESTAMP(now())-"+val; };
PropPage.tCreated.cond0F=PropPage.tMod.cond0F=PropPage.tModCache.cond0F=tmpCond0F;
//PropPage.size.cond0F=function(name, val){ return "p.size>"+val;};


tmpCond1F=function(name, val){  return "UNIX_TIMESTAMP("+name+")>UNIX_TIMESTAMP(now())-"+val; };
PropPage.tCreated.cond1F=PropPage.tMod.cond1F=PropPage.tModCache.cond1F=tmpCond1F;

//PropPage.parentSite.condBNameF=function(name, Val){ return "siteName";} // Becomes "pp.siteName"
PropPage.parent.condBNameF=function(name, Val){ return "idPage";} // Becomes "pp.idPage"
PropPage.parent.boIncludeNull=1;
PropPage.siteName.boIncludeNull=1;

//PropPage.parentSite.pre='pp.';
PropPage.parent.pre='pp.';
//PropPage.size.pre = PropPage.tCreated.pre = PropPage.tMod.pre = PropPage.tModCache.pre = PropPage.boOther.pre = 'p.';
//PropPage.nChild.pre='p.';
//PropPage.nImage.pre='p.';


PropPage.parent.relaxCountExp=function(name){ return "count(DISTINCT p.idPage, p.idSite, p.pageName)"; }  

PropPage.parent.histF=function(name, strTableRef,strCond,strOrder){
  return "SELECT aaa.tmpBinName AS bin, count(*) AS groupCount FROM \n\
(SELECT p.*, pp.idPage AS tmpBinName FROM \n\
"+strTableRef+" \n\
"+strCond+"\n\
GROUP BY p.idPage ) aaa\n\
GROUP BY bin ORDER BY "+strOrder+";";
}   // , p.siteName, p.pageName pp.idPage, 

PropPage.parent.histF=function(name, strTableRef,strCond,strOrder){
  return `SELECT pp.idPage AS bin, count(*) AS groupCount FROM 
`+pageLastSiteView+` p 
LEFT JOIN (
  `+subTab+` s 
  JOIN `+pageTab+` pp ON pp.idPage=s.idPage
) ON s.idSite=p.idSite AND s.pageName=p.pageName 
`+strCond+`
GROUP BY bin ORDER BY `+strOrder+`;`;
}


var tmpBinValueF=function(name){ return "COUNT(DISTINCT p.idSite, p.pageName, p."+name+")";}
var StrTmp=['parent', 'siteName','size','boOR','boOW','boSiteMap','boTalk','boTemplate','boOther','tCreated','tMod','tModCache'];
for(var i=0;i<StrTmp.length;i++){  var name=StrTmp[i]; PropPage[name].binValueF=tmpBinValueF; }


var tmpHistCondF=function(name){ return "-UNIX_TIMESTAMP(p."+name+")+UNIX_TIMESTAMP(now())";};
PropPage.tCreated.histCondF=PropPage.tMod.histCondF=PropPage.tModCache.histCondF=tmpHistCondF;



/*
PropPage.tMod.selF=PropPage.tMod.selF=selTimeF;
//PropPage.nChild.selF=function(name){ return "COUNT(DISTINCT sc.pageName)";};
PropPage.nChild.selF=function(name){ return "COUNT(DISTINCT CONCAT(sc.idSite,sc.pageName)";};
PropPage.nImage.selF=function(name){ return "COUNT(DISTINCT sI.imageName)";};
*/

PropImage={
parentSite:          {b:'11',feat:{kind:'B'}},
parent:              {b:'11',feat:{kind:'B'}},
size:                {b:'11',feat:sizeImageFeat},
tCreated:             {b:'11',feat:tFeat},
boOther:             {b:'01',feat:{kind:'BN',span:1}}
};
StrOrderFiltImage=Object.keys(PropImage);

extend(PropImage,{
imageName:           {b:'00'},
idImage:             {b:'00'},
idFile:              {b:'00'},
nParent:             {b:'00'}
});

tmpCond0F=function(name, val){  return "UNIX_TIMESTAMP("+name+")<=UNIX_TIMESTAMP(now())-"+val; };
PropImage.tCreated.cond0F=tmpCond0F;

//PropImage.size.cond0F=function(name, val){ return "i.size>"+val;};

tmpCond1F=function(name, val){  return "UNIX_TIMESTAMP("+name+")>UNIX_TIMESTAMP(now())-"+val; };
PropImage.tCreated.cond1F=tmpCond1F;
//PropImage.size.cond1F=function(name, val){ return "i.size<="+val;};

PropImage.parentSite.condBNameF=function(name, Val){ return "siteName";} // Becomes "pp.siteName"
PropImage.parent.condBNameF=function(name, Val){ return "idPage";}  // Becomes "pp.pageName"
PropImage.parentSite.boIncludeNull=1;
PropImage.parent.boIncludeNull=1;

PropImage.parentSite.pre='pp.';
PropImage.parent.pre='pp.';
PropImage.size.pre = PropImage.tCreated.pre = PropImage.boOther.pre = 'i.';



PropImage.parentSite.relaxCountExp=function(name){ return "count(DISTINCT i.idImage)"; }  
PropImage.parent.relaxCountExp=function(name){ return "count(DISTINCT i.idImage, i.imageName)"; }  



PropImage.parentSite.histF=function(name, strTableRef,strCond,strOrder){
  return `SELECT pp.siteName AS bin, count(*) AS groupCount FROM 
`+imageTab+` i 
LEFT JOIN (
  `+subImageTab+` s 
  JOIN `+pageSiteView+` pp ON pp.idPage=s.idPage
) ON s.imageName=i.imageName 
`+strCond+`
GROUP BY bin ORDER BY `+strOrder+`;`;
}

PropImage.parent.histF=function(name, strTableRef,strCond,strOrder){
  return `SELECT pp.idPage AS bin, count(*) AS groupCount FROM 
`+strTableRef+`  
`+strCond+`
GROUP BY bin ORDER BY `+strOrder+`;`;
}

PropImage.parent.histF=function(name, strTableRef,strCond,strOrder){
  return `SELECT pp.idPage AS bin, count(*) AS groupCount FROM 
`+imageTab+` i 
LEFT JOIN (
  `+subImageTab+` s 
  JOIN `+pageSiteView+` pp ON pp.idPage=s.idPage
) ON s.imageName=i.imageName 
`+strCond+`
GROUP BY bin ORDER BY `+strOrder+`;`;
}

var tmpF=function(name){ return "COUNT(DISTINCT i.imageName, i."+name+")";}
var StrTmp=['size','tCreated','boOther'];
for(var i=0;i<StrTmp.length;i++){  var name=StrTmp[i]; PropImage[name].binValueF=tmpF; }

var tmpHistCondF=function(name){ return "-UNIX_TIMESTAMP(i."+name+")+UNIX_TIMESTAMP(now())";};
PropImage.tCreated.histCondF=tmpHistCondF;

//PropImage.tCreated.selF=selTimeF;

featCalcValExtend=function(Prop){
  for(var name in Prop){
    var prop=Prop[name];
    if(!('feat' in prop)) continue;
    var feat=prop.feat, boBucket='bucket' in feat, boMin='min' in feat;
    if(boBucket||boMin){  // set n (=length) (if applicable)
      //var len;   if(boBucket) len=feat.bucket.length; else if(boMin) len=feat.min.length;
      var len=boBucket?feat.bucket.length:feat.min.length;
      Prop[name].feat.n=len;  Prop[name].feat.last=len-1;
    }
  
    if(feat.kind[0]=='S'){
            // Create feat.max;  maxClosed
      feat.max=[]; var maxClosed=[];
      var jlast=feat.last;    
      for(var j=0;j<jlast;j++){ 
        var tmp=feat.min[j+1]; feat.max[j]=tmp; maxClosed[j]=tmp-1;
      }
      feat.max[jlast]=intMax; maxClosed[jlast]=intMax;

            // Create minName/maxName (labels in 'sel0') and  feat.maxName (labels in 'sel1') 
      feat.minName=[].concat(feat.min);
      feat.maxName=[].concat(maxClosed);  feat.maxName[feat.last]="&infin;";

      if(!('bucketLabel' in feat)){   feat.bucketLabel=[].concat(feat.min);       feat.bucketLabel[feat.last]='&ge;'+feat.bucketLabel[feat.last]; } // (labels in histogram)

      Prop[name].feat=feat;
    }
  }
}

KeyColPage=Object.keys(PropPage);   nColPage=KeyColPage.length;   KeyColPageFlip=array_flip(KeyColPage);
KeyColImage=Object.keys(PropImage);   nColImage=KeyColImage.length;   KeyColImageFlip=array_flip(KeyColImage);


featCalcValExtend(PropPage);
featCalcValExtend(PropImage);


aPassword=SHA1(aPassword+strSalt);
vPassword=SHA1(vPassword+strSalt);

objOthersActivity=null; boPageBUNeeded=null; boImageBUNeeded=null;
objOthersActivityDefault={nEdit:0, pageName:'',  nImage:0, imageName:''};
// tLastBackup=0; tLastEdit=0; tImageLastBackup=0; tImageLastChange=0;


//tmpSubNew='tmpSubNew';
sqlTmpSubNewCreate="CREATE TEMPORARY TABLE IF NOT EXISTS tmpSubNew (pageName varchar(128) NOT NULL,  boOn TINYINT(1) NOT NULL)";  //,  UNIQUE KEY (pageName)
//tmpSubNewImage='tmpSubNewImage';
sqlTmpSubNewImageCreate="CREATE TEMPORARY TABLE IF NOT EXISTS tmpSubNewImage (imageName varchar(128) NOT NULL)";  //,  UNIQUE KEY (imageName)


strDBPrefix='mmmWiki';
StrTableKey=["sub", "subImage", "version", "page", "thumb", "image", "video", "file", "setting", "redirect", "redirectDomain", "site", "nParent", "nParentI"]; //,"cache" , "siteDefault"
//StrTableKey=["sub", "statNChild", "statParent", "subImage", "version", "page", "thumb", "image", "video", "file", "setting", "redirect", "redirectDomain", "site"];
//StrViewsKey=["pageWWW", "pageLastSlim", "pageLast", "redirectWWW", "parentInfo", "parentImInfo", "childInfo", "childImInfo", "subWChildID", "subWExtra"]; 
StrViewsKey=["pageSite", "pageLast", "pageLastSite", "redirectSite", "parentInfo", "parentImInfo", "childInfo", "childImInfo", "subWChildID", "subWExtra"]; 
TableName={};for(var i=0;i<StrTableKey.length;i++) {var name=StrTableKey[i]; TableName[StrTableKey[i]+"Tab"]=strDBPrefix+'_'+name;}
ViewName={};for(var i=0;i<StrViewsKey.length;i++) {var name=StrViewsKey[i]; ViewName[StrViewsKey[i]+"View"]=strDBPrefix+'_'+name;}

extract(TableName);
extract(ViewName);



strTableRefPage="("+pageLastSiteView+" p) \n\
LEFT JOIN "+subTab+" s ON s.idSite=p.idSite AND s.pageName=p.pageName \n\
LEFT JOIN ("+pageTab+" pp) ON pp.idPage=s.idPage\n\
LEFT JOIN ("+nParentTab+" np) ON p.pageName=np.pageName AND p.idSite=np.idSite";

// Starting with the list of pages
// The 1:st join: adds idPage of parent (The table is expanded if there are multiple parents)
// The 2:nd join: adds pageName of parent(s)
// The 3:rd join: adds nParent


strTableRefImage=imageTab+" i \n\
LEFT JOIN "+subImageTab+" s ON s.imageName=i.imageName \n\
LEFT JOIN ("+pageSiteView+" pp) ON pp.idPage=s.idPage \n\
LEFT JOIN ("+nParentITab+" np) ON i.imageName=np.imageName";



strTableRefPageHist="("+pageLastSiteView+" p) \n\
LEFT JOIN (\n\
  "+subTab+" s \n\
  JOIN "+pageTab+" pp ON pp.idPage=s.idPage\n\
) ON s.idSite=p.idSite AND s.pageName=p.pageName";
// The query inside the parantheses creates a table with all parent-child relations: pp.siteName, pp.pageName (parent) <-> s.siteName, s.pageName (child). 
// Should be used with a COUNT(DISTINCT p.idSite, p.pageName, XXX)  


strTableRefImageHist=imageTab+" i \n\
LEFT JOIN (\n\
  "+subImageTab+" s \n\
  JOIN "+pageSiteView+" pp ON pp.idPage=s.idPage\n\
) ON s.imageName=i.imageName";
// The query inside the parantheses creates a table with all parent-child relations: pp.siteName, pp.pageName (parent) <-> s.imageName (child). 
// Should be used with COUNT(DISTINCT i.imageName, XXX) 






nDBConnectionLimit=10; nDBQueueLimit=100;
nDBRetry=14;

setUpMysqlPool=function(){
  var uriObj=url.parse(uriDB); 
  var StrMatch=RegExp('^(.*):(.*)$').exec(uriObj.auth);
  var nameDB=uriObj.pathname.substr(1);
  var mysqlPool  = mysql.createPool({
    connectionLimit : nDBConnectionLimit,
    host            : uriObj.host,
    user            : StrMatch[1],
    password        : StrMatch[2],
    database        : nameDB,
    multipleStatements: true,
    waitForConnections:true,
    queueLimit:nDBQueueLimit,
    flags:'-FOUND_ROWS'
  });
  mysqlPool.on('error',function(e){debugger});
  return mysqlPool;
}

TLSDataExtend=function(){
  this.getContext=function(domainName){
    for(var i=0;i<this.length;i++){
      if(this[i].testDomain(domainName)) return this[i].context;
    }
    return undefined;
    //return false;
  }
  
  for(var i=0;i<this.length;i++){
    var item=this[i];
    if('domainReg' in item) {  item.regexp=RegExp(item.domainReg);       item.testDomain=function(domain){ return this.regexp.test(domain);};    } 
    else item.testDomain=function(domain){ return this.domain===domain;};
    //item.context=crypto.createCredentials({        key:  item.strKey,        cert: item.strCert      }).context;
    item.context=tls.createSecureContext({        key:  item.strKey,        cert: item.strCert      });//.context;
  }
}
