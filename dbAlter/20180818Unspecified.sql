ALTER TABLE mmm.mmmWiki_video CHANGE COLUMN created tCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE mmm.mmmWiki_thumb CHANGE COLUMN created tCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE mmm.mmmWiki_site CHANGE COLUMN created tCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE mmm.mmmWiki_redirectDomain CHANGE COLUMN created tCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE mmm.mmmWiki_redirect CHANGE COLUMN created tCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE mmm.mmmWiki_image CHANGE COLUMN created tCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

RENAME TABLE mmm.mmmWiki_binsCreated TO mmm.mmmWiki_binsTCreated;
