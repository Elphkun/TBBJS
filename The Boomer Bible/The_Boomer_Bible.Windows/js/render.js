// render script 2.0

var bookQuery = "pspeciastes";
var chapterQuery = "1";

var topSubtitle = new String();
var book = new String();
var bottomSubtitle = new String();
var chapterMax = new Number();
var leftPageHeader = new String();
var rightPageHeader = new String();
var chapterTitle = new String();
var verses = new Array();

SQLite3JS.openAsync('\TBB.db').then(function (db) {
    return db.allAsync("SELECT * FROM chaptertable where book like '" + bookQuery + "' and chapter like '% " + chapterQuery + "'  order by id asc;").then(function (row) {
        topSubtitle = toStaticHTML(row[0].TOPSUBTITLE);
        book = toStaticHTML(row[0].BOOK);
        bottomSubtitle = toStaticHTML(row[0].BOTTOMSUBTITLE);
        chapterTitle = toStaticHTML(row[0].CHAPTER);
        chapterMax = toStaticHTML(row[0].CHAPTERMAX);
        leftPageHeader = toStaticHTML(row[0].LEFTPAGEHEADER);
        rightPageHeader = toStaticHTML(row[0].RIGHTPAGEHEADER);
    })

        .then(function () {
            db.allAsync("SELECT * FROM versetable where book like '" + bookQuery + "' and chapter like '" + chapterQuery + "';").then(function (row2) {
                for (var i = 0; i < row2.length; i++) {
                    verses.push(toStaticHTML(row2[i].TEXT));
                }



                // the next few var's we can't populate without verses[] filled first

                var versesPlaintext = verses.map(function (vs) { return $(vs).text(); }); // strip HTML tags from verse text for character count function below.
                var breakVerseIndex = function () { // code to count all characters in chapter, cut in half, and split between book pages. Credit to Robbie-kun.

                    var charCount = 0; /*Initializes the count*/

                    /*Iterates through all the versus in your chapter, which gives you the count
                    of all characters in your chapter*/
                    for (var i = 0; i < versesPlaintext.length; i++) {
                        charCount = charCount + versesPlaintext[i].length;
                    }
                    var medianChecker = 0; //We use another variable because we wanna remember the old one.
                    for (var i = 0; i < versesPlaintext.length; i++) {
                        medianChecker = medianChecker + versesPlaintext[i].length; //This is your old loop, just with the new variable name
                        if ((charCount / medianChecker) <= 2) {
                            return (i);
                        }
                    }

                };

                leftChapterPage = function () {
                    var l = new Array();
                    l[0]="";
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
                    $('#book').find('font').html(book);
                    if (bottomSubtitle != 'null') { $('#bottomSubtitle').html(bottomSubtitle); }
                    $('#chapterMax').find('font').text("{" + chapterMax + " Chapters}");
                    if (leftPageHeader != 'null') { $('#leftPageHeader').html(leftPageHeader); }
                    if (rightPageHeader != 'null') { $('#rightPageHeader').html(rightPageHeader); }
                    $('#chapterTitle').html(chapterTitle);
                    for (var i = 0; i < leftChapterPage().length; i++) {
                        $('#leftChapterPage').append('<li>'+leftChapterPage()[i]+'<li>');
                    };
                    for (var i = 0; i < rightChapterPage().length; i++) {
                        $('#rightChapterPage').append('<li>' + rightChapterPage()[i] + '<li>');
                    };

                    // The following comments are attempts to correct the first verse 'line-height' issue

                    $('#leftChapterPage li:nth-child(3)').css('line-height', '62.5%');
                    //$('#leftChapterPage li:nth-child(4)').css('line-height', '100%');
                    $('#leftChapterPage li:nth-child(3)').css('padding-bottom', '.5em');
                    // screwed up $('#rightChapterPage'):nth-child(1)').css('line-height', '1em');
                     
                });

            }).then(function () { db.close(); });
        });
});
