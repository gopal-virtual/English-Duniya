#Media Sync Start

if [ "$content_environment" = 'test' ]; then
echo  $MEDIA_SOURCE --download --remoteresource .	
# blobxfer --no-computefilemd5 --saskey "?sv=2015-04-05&ss=b&srt=sco&sp=rwdlac&se=2017-02-28T15:12:28Z&st=2016-11-10T07:12:28Z&spr=https&sig=RGOG%2Bj0fU%2B4q1Puwo%2B8WXq5p3%2BzDLyBiVjzVedC%2FU5o%3D" cctestmedia media $MEDIA_SOURCE --download --remoteresource .
fi
if [ "$content_environment" = 'production' ]; then
echo $MEDIA_SOURCE --download --remoteresource .
blobxfer --no-computefilemd5 --saskey "?sv=2015-04-05&ss=b&srt=sco&sp=rwdlac&se=2018-05-31T10:28:00Z&st=2016-08-27T02:28:00Z&spr=https&sig=bFWCBNiodY%2BxfcMsEMSKc2jGAB1jTiEW0yp0WqEnyVo%3D" edmedia media $MEDIA_SOURCE --download --remoteresource .
fi

# Media Sync end