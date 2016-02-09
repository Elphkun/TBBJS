// render script 2.0

var icrQuery = "bout.9";

var topSubtitle = new String();
var book = new String();
var bottomSubtitle = new String();
var chapterMax = new Number();
var leftPageHeader = new String();
var rightPageHeader = new String();
var chapterTitle = new String();
var verses = new Array();
var verseID = new Array();

SQLite3JS.openAsync('\TBB.db').then(function (db) {
    return db.allAsync("SELECT * FROM chaptertable where ICR_name like '"+icrQuery+"' order by id asc;").then(function (row) {
        topSubtitle = toStaticHTML(row[0].TOPSUBTITLE);
        book = toStaticHTML(row[0].BOOK);
        bottomSubtitle = toStaticHTML(row[0].BOTTOMSUBTITLE);
        chapterTitle = toStaticHTML(row[0].CHAPTER);
        chapterMax = toStaticHTML(row[0].CHAPTERMAX);
        leftPageHeader = toStaticHTML(row[0].LEFTPAGEHEADER);
        rightPageHeader = toStaticHTML(row[0].RIGHTPAGEHEADER);
    })

        .then(function () {
            db.allAsync("SELECT * FROM versetable where ICR_name like '" + icrQuery+ "%' order by id;").then(function (row2) {
                for (var i = 0; i < row2.length; i++) {
                    verses.push(row2[i].TEXT);
                    verseID.push(row2[i].ID);
                }
                               
                    verses = verses.map(function (encodedString) {
                    var textArea = document.createElement('textarea');
                    textArea.innerHTML = encodedString;
                    return textArea.value;
                });
                // the next few var's we can't populate without verses[] filled first
                
                var versesPlaintext = verses.map(function (vs) { return $('<span />').append(vs).text(); }); // strip HTML tags from verse text for character count function below.
                var breakVerseIndex = function () { // code to count all characters in chapter, cut in half, and split between book pages. Credit to Robbie-kun.

                    var charCount = 0; /*Initializes the count*/

                    /*Iterates through all the versus in your chapter, which gives you the count
                    of all characters in your chapter*/
                    for (var i = 0; i < versesPlaintext.length; i++) {
                        charCount = charCount + punycode.ucs2.decode(versesPlaintext[i]).length;
                    }
                    var medianChecker = 0; //We use another variable because we wanna remember the old one.
                    for (var i = 0; i < versesPlaintext.length; i++) {
                        medianChecker = medianChecker + punycode.ucs2.decode(versesPlaintext[i]).length; //This is your old loop, just with the new variable name
                        if ((charCount / medianChecker) <= 2) {
                            return (i);
                        }
                    }

                };

                leftChapterPage = function () {
                    var l = new Array();

                    for (var i = 0; i <= breakVerseIndex() ; i++) {
                        l.push(verses[i]);
                    }
                    return l;
                };

                rightChapterPage = function () {
                    var r = new Array();

                    for (var i = (breakVerseIndex() + 1) ; i < verses.length ; i++) {
                        r.push(verses[i]);
                    }
                    return r;
                }
                $(document).ready(function () {
                    if (topSubtitle != 'null') { $('#topSubtitle').html(topSubtitle); }
                    $('#book').html(book);
                    if (bottomSubtitle != 'null') { $('#bottomSubtitle').html(bottomSubtitle); }
                    $('#chapterMax').find('font').text("{" + chapterMax + " Chapters}");
                    if (leftPageHeader != 'null') { $('#leftPageHeader').html(leftPageHeader); }
                    if (rightPageHeader != 'null') { $('#rightPageHeader').html(rightPageHeader); }
                    $('#chapterTitle').html(chapterTitle);
                    var idCount = 0;
                    for (var i = 0; i < leftChapterPage().length; i++) {
                        $('#leftChapterPage').append('<li id="' + verseID[idCount] + '">' + leftChapterPage()[i]);
                        idCount++;
                    };
                    for (var i = 0; i < rightChapterPage().length; i++) {
                        $('#rightChapterPage').append('<li id="' + verseID[idCount] + '">' + rightChapterPage()[i]);
                        idCount++;
                    };
                    var firstItems = $('#leftChapterPage li:first-child'); //first list item of the fox class ul
                    firstItems.each(function () {
                        //get the first child that has text in it.
                        var contentsWithText = $(this).contents().filter(function () {
                            //ignore sup tags
                            if ($(this).prop("tagName") == "SUP") return false;
                            return $.trim($(this).text()) != "";
                        }).first();

                        //can delete the alert here after you're done debugging shit
                        if (contentsWithText.length == 0) {
                            alert("can't find any text.")
                            return;
                        }

                        //get the text
                        var text = $.trim(contentsWithText.text());
                        //strip the initial letter
                        var first_letter = text.substr(0, 1);
                        if (first_letter == "“" || "‘")
                        {
                            first_letter = text.substr(0, 2);
                        }
                        //replace the content with a span with class dropcap followed by the remainder of the content
                        contentsWithText.replaceWith('<span class="dropcap">' + first_letter + '</span>' + text.slice(first_letter.length));
                    });
                    $('#leftChapterPage li:first-child').addClass('leftFirstLine');
                    $('#rightChapterPage li:first-child').addClass('rightFirstLine');
                    // The following comments are attempts to correct the first verse 'line-height' issue

                    //  $('#leftChapterPage li:nth-child(1)').css('line-height', '62.5%');
                    // $('#leftChapterPage li:nth-child(4)').css('line-height', '100%');
                    // $('#leftChapterPage li:nth-child(1)').css('padding-bottom', '.5em');
                    // screwed up $('#rightChapterPage'):nth-child(1)').css('line-height', '1em');

                });

            }).then(function () { db.close(); });
        });
});
