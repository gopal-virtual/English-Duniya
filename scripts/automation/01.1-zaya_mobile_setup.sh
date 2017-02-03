content_type=non-bundled
is_bundled=false
node_locked=true
languages=hi
keep_crosswalk=true
build_architecture=arm


if [ "$BRANCH_NAME" = 'staging' ]; then
blobxfer --saskey "?sv=2015-04-05&ss=b&srt=sco&sp=rwdlac&se=2017-02-28T15:12:28Z&st=2016-11-10T07:12:28Z&spr=https&sig=RGOG%2Bj0fU%2B4q1Puwo%2B8WXq5p3%2BzDLyBiVjzVedC%2FU5o%3D" cctestmedia media $TEST_SYNC_DIR --download --remoteresource .
BUILD_TYPE='test'
ENV='test'
fi
if [ "$BRANCH_NAME" = 'master' ]; then
blobxfer --saskey "?sv=2015-04-05&ss=b&srt=sco&sp=rwdlac&se=2018-05-31T10:28:00Z&st=2016-08-27T02:28:00Z&spr=https&sig=bFWCBNiodY%2BxfcMsEMSKc2jGAB1jTiEW0yp0WqEnyVo%3D" edmedia media $PROD_SYNC_DIR --download --remoteresource .
BUILD_TYPE='production'
ENV='production'
environment=production 
content_environment=production
lessonsdb=http://ed-couch.zaya.in/lessonsdb
diagnosis_translationsdb=http://ed-couch.zaya.in/diagnosis_translations
fi





echo Campaign name $campaign_name
echo Campaign owner name $campaign_owner_name