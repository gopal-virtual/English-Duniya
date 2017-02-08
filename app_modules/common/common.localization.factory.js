(function() {
  'use strict';
  angular
    .module('common')
    .factory('localized', localized);
  /* @ngInject */
  function localized(
  ) {
    var localizedText = {"diagnosis":{"start":{"label":"Let's take a small practice","lang":{"hi":"चलो अब हम एक छोटसा अभ्यास करेंगे","ta":"வாருங்கள்! உங்களது ஆங்கிலத் திறனை சோதித்து பார்க்கலாம்","bn":"আপনার ইংরেজি এমনিতে কেমন তা পরীক্ষা করা যাক!","mr":"आपले इंग्रजी कितपत चांगले आहे हे आपण तपासू या","kn":"ನಿಮ್ಮ ಇಂಗ್ಲೀಷ್ ಈಗಾಗಲೇ ಎಷ್ಟು ಉತ್ತಮವಾಗಿದೆ ಎಂಬುದನ್ನು ಈಗ ಚೆಕ್ ಮಾಡೋಣ!","gu":"ચાલો આપણે તમારું અંગ્રેજી પહેલેથી જ કેટલું સારું છે તે તપાસીએ કરીએ!","te":"మీ ఆంగ్లం ఇప్పటికే ఎంత ఉందో తనిఖీ చేద్దాం!"}}},"registration":{"Language":{"label":"<language> to english","lang":{"hi":"हिन्दी से अँग्रेज़ी","te":"మీ భాషను ఎంచుకోండి","ta":"தமிழ்லிள் இ௫ந்து ஆங்கிலம்","bn":"বাংলা থেকে ইংরেজি","mr":"मराठीतून इंग्रजी","kn":"ಕನ್ನಡ ಇಂಗ್ಲೀಷ್","gu":"ગુજરાતી ઇંગલિશ"}},"Name":{"label":"Write your name","lang":{"hi":"आपका नाम लिखिए","te":"మీ పేరుని టైప్ చేయండి","ta":"உங்கள் பெயரை பதிவுச் செய்யுங்கள்","bn":"আপনার নাম টাইপ করুন","mr":"आपले नाव टाइप करा","kn":"ನಿಮ್ಮ ಹೆಸರನ್ನು ಟೈಪ್ ಮಾಡಿ","gu":"તમારા નામમાં ટાઈપ કરો"}},"Gender":{"label":"Boy or girl?","lang":{"hi":"लड़का या लड़की","te":"అబ్బాయా లేదా అమ్మాయా?","ta":"பையன்? அல்லது பெண்?","bn":"ছেলে না মেয়ে?","mr":"मुलगा वा मुलगी?","kn":"ಹುಡುಗ ಅಥವಾ ಹುಡುಗಿ?","gu":"છોકરો અથવા છોકરી?"}},"Class":{"label":"Which class do you study in?","lang":{"hi":"लड़का या लड़की","ta":"உங்கள் வகுப்பை தேர்ந்தெடுங்கள்","bn":"আপনার ক্লাস বাছুন","mr":"आपली इयत्ता निवडा","kn":"ನಿಮ್ಮ ಕ್ಲಾಸ್ ಅನ್ನು ಸೆಲೆಕ್ಟ್ ಮಾಡಿ","gu":"તમારો વર્ગ પસંદ કરો","te":"మీ తరగతి ఎంపిక చేయండి"}}}};
    var localizedAudio = {"Video":{"LearnedFromVideo":{"label":"Yay, we learned a lot from video","lang":{"hi":"1483685179452-hin-yay_we_learned_a_lot_from_video.mp3","ta":"1484561656646-ta_avat068.mp3"}}},"Vocabulary":{"ItsYourTurn":{"label":"Now it's your turn","lang":{"hi":"1483684687362-hin-lets_go_now_its_your_turn.mp3","ta":"1486547899086.mp3","gu":"1486547915455.mp3","bn":"1486547929166.mp3","kn":"1486547948159.mp3","mr":"1486547971954.mp3","te":"1486548022267.mp3"}}},"app":{"ExitApp":{"label":"Do you want to exit?","lang":{"hi":"1483685890819-hin-do_you_want_to_exit.mp3","ta":"1485863945420.mp3","bn":"1485779811987.mp3","mr":"1485863988812.mp3","kn":"1485944035256.mp3","gu":"1485948140663.mp3"}},"ExitResource":{"label":"Do you want to continue?","lang":{"hi":"1483685944972-tel_do_you_want_to_continue.mp3","bn":"1485779838247.mp3","ta":"1485866810274.mp3","mr":"1485931762748.mp3","kn":"1485944781857.mp3","gu":"1486364339970.mp3"}}},"demo":{"StartEnglish":{"label":"Let's start learning english now","lang":{"hi":"1483682704809-hin-lets_start_learning_english.mp3","bn":"1485779857410.mp3","mr":"1485864004747.mp3","kn":"1485944143467.mp3","ta":"1486021308554.mp3"}}},"diagnosis":{"landing":{"label":"Let's take a small practice","lang":{"hi":"1483679312160-hin-lets_start_a_small_practice.mp3","bn":"1486016723040.mp3","kn":"1486016805627.mp3","ta":"1486017390283.mp3","gu":"1486364411538.mp3"}},"level1":{"label":"Yay, you're at level one","lang":{"hi":"1483679731758-hin-wow_you_are_at_level_1.mp3","te":"1483679759724-tel-wow_you_are_at_level_1.mp3","bn":"1485779892650.mp3","ta":"1485855241074.mp3","mr":"1485864024953.mp3","kn":"1485944171918.mp3","gu":"1485948207714.mp3"}},"level2":{"label":"Yay, you're at level two","lang":{"hi":"1483679782910-hin-wow_you_are_at_level_2.mp3","te":"1483679799310-tel-wow_you_are_at_level_2.mp3","bn":"1485779903788.mp3","ta":"1485860571021.mp3","mr":"1485864059216.mp3","kn":"1485944188836.mp3","gu":"1485948231503.mp3"}},"level3":{"label":"Yay, you're at level three","lang":{"hi":"1483679826688-hin-wow_you_are_at_level_3.mp3","te":"1483679861262-tel-wow_you_are_at_level_3.mp3","bn":"1485779916570.mp3","ta":"1485857320413.mp3","mr":"1485864078977.mp3","kn":"1485944253530.mp3","gu":"1485948259291.mp3"}},"level4":{"label":"Yay, you're at level four","lang":{"hi":"1483679993386-hin-wow_you_are_at_level_4.mp3","bn":"1485779945057.mp3","ta":"1485860603562.mp3","kn":"1485944266686.mp3"}},"level5":{"label":"Yay, you're at level five","lang":{"hi":"1483680015911-hin-wow_you_are_at_level_5.mp3","bn":"1485779955205.mp3","ta":"1485857361197.mp3","mr":"1485864126803.mp3","kn":"1485944351408.mp3","gu":"1485948326470.mp3"}},"level6":{"label":"Yay, you're at level six","lang":{"hi":"1483680037668-hin-wow_you_are_at_level_6.mp3","bn":"1485779968423.mp3","ta":"1485857371454.mp3","mr":"1485864169769.mp3","kn":"1485944384464.mp3","gu":"1485948339577.mp3"}},"level7":{"label":"Yay, you're at level seven","lang":{"hi":"1483680074600-hin-wow_you_are_at_level_7.mp3","bn":"1485780024118.mp3","ta":"1485857385588.mp3","mr":"1485864191427.mp3","kn":"1485944407043.mp3","gu":"1485948350249.mp3"}},"level8":{"label":"Yay, you're at level eight","lang":{"hi":"1483680146938-hin-wow_you_are_at_level_8.mp3","bn":"1485780037374.mp3","ta":"1485857398316.mp3","mr":"1485864206954.mp3","kn":"1485944435820.mp3","gu":"1485948364012.mp3"}},"ComingSoon":{"label":"Coming soon with more lessons","lang":{"hi":"1483684466189-hin-we_will_come_back_soon_with_new_lesson_till_then_you_can_learn_this.mp3","te":"1483684509313-tel-we_will_come_back_soon_with_new_lesson_till_then_you_can_learn_this.mp3","ta":"1485866787457.mp3","mr":"1485927049725.mp3","kn":"1485944592770.mp3","gu":"1486364452642.mp3","bn":"1486364539528.mp3"}}},"phone":{"EnterPhoneNumber":{"label":"Type your phone number","lang":{"hi":"1483682575829-hin-write_your_number.mp3","te":"1483682593022-tel-write_your_number.mp3","bn":"1485780056389.mp3","ta":"1485857512347.mp3","mr":"1485864595979.mp3","kn":"1485944612514.mp3","gu":"1486012232455.mp3"}},"EnterOtp":{"label":"Type the code sent on your phone","lang":{"hi":"1483680216076-hin-to_verify_your_number_write_the_code_you_got_in_your_phone.mp3","te":"1483680242386-tel-to_verify_your_number_write_the_code_you_got_in_your_phone.mp3","bn":"1485780074287.mp3","ta":"1485860701126.mp3","mr":"1485927035909.mp3","kn":"1485944624954.mp3","gu":"1485948492248.mp3"}}},"profile":{"AddProfile":{"label":"Do you want to create a new profile","lang":{"hi":"1483680390940-hin-do_you_want_to_create_a_new_profile.mp3","ta":"1485857670686.mp3","mr":"1485933854601.mp3"}},"ChangeProfile":{"label":"Do you want to change the profile","lang":{"hi":"1483680804991-hin-do_you_want_to_select_a_different_profile.mp3","te":"1483680882762-tel-do_you_want_to_select_a_different_profile.mp3","ta":"1484569239053-ta_avat005_ are you sure you want to switch profile.mp3","bn":"1485780239051.mp3","mr":"1485864724944.mp3","kn":"1485944696390.mp3","gu":"1485948530803.mp3"}},"ChooseOrCreate":{"label":"Choose your profile or make a new profile","lang":{"hi":"1483686138013-hin-choose_your_profile_or_make_new_profile.mp3","ta":"1484563806452-ta_avat069.mp3","bn":"1485850241788.mp3","mr":"1485931448265.mp3","kn":"1486012794070.mp3","gu":"1486012807056.mp3"}}},"registration":{"Welcome":{"label":"Welcome to English Duniya","lang":{"hi":"1483682415957-hin-namaste_welcome_to_english_duniya.mp3","te":"1483682473005-tel-namaste_welcome_to_english_duniya.mp3","bn":"1485780148793.mp3","ta":"1485860824259.mp3","mr":"1485864766204.mp3","kn":"1485944828824.mp3","gu":"1486012105005.mp3"}},"SelectLanguage":{"label":"<language> to English","lang":{"hi":"1483683274454-hin-learn_hindi_to_english.mp3","ta":"1484564604919-ta_You want to learn English via _ using Tamil.mp3","bn":"1485850213476.mp3","mr":"1485933882834.mp3","gu":"1486012762324.mp3","kn":"1486012772851.mp3"}},"WriteName":{"label":"Write your name","lang":{"hi":"1483681155637-hin-write_your_name.mp3","te":"1483681208688-tel-write_your_name.mp3","bn":"1485780179844.mp3","ta":"1485860893564.mp3","mr":"1485864783002.mp3","kn":"1485944871603.mp3","gu":"1485948585110.mp3"}},"SelectGender":{"label":"Boy or Girl?","lang":{"hi":"1483680974074-hin-boy_or_girl.mp3","te":"1483681000687-tel-boy_or_girl.mp3","bn":"1485780196008.mp3","ta":"1485860905870.mp3","mr":"1485864796152.mp3","kn":"1485944883202.mp3","gu":"1486012052943.mp3"}},"SelectClass":{"label":"Which class do you read in?","lang":{"hi":"1483681387906-hin-which_class_do_you_read.mp3","te":"1483681559733-tel-which_class_do_you_read.mp3","bn":"1485780205202.mp3","ta":"1485861018803.mp3","mr":"1485864805131.mp3","kn":"1485944903411.mp3","gu":"1486012065632.mp3"}}}};
    return {
      text: localizedText,
      audio: localizedAudio
    };
  }
})();