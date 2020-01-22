var documents = [];
var documents_correct = 0;
var documents_wrong = 0;
var old_document;

/*
 * Get available training sets from API and fill select
 */
function get_available_sets() {
  $.ajax({
    type: 'GET',
    url: '/sets',
    dataType: "json",
    async:false,
    success: function(data) {
      for (var i = 0; i < data.length; i++) {
        $("#select_training_set").append('<option id=' + data[i]["pk"] + ' value=' + data[i]["pk"] + '>' + data[i]["fields"]["title"] + '</option>');
      }
    }
  });
}

/*
 * If user has selected a training set, load its documents (words) and start training session
 */
function get_documents() {
  var result;
  $.ajax({
    type: 'GET',
    url: '/set/'+$("#select_training_set").val()+'/documents',
    dataType: "json",
    async:false,
    success: function(data) {
      result = data;
    }
  });
  return result;
}

/*
 * Select a random new document out of the array of existing documents and then remove it. Return removed element.
 */
function get_random_document() {
  var document_index = Math.floor(Math.random() * documents.length);
  var new_document = documents[document_index];
  documents.splice(document_index, 1);
  return new_document;
}

/*
 * Render HTML code that shows the user a new image and input text field
 */
function render_question(new_document) {
  var html =  '<img class="img-fluid rounded" style="max-width: 300px;" src="/media/' + new_document["fields"]["image"] + '">' +
              '<div class="col-xs-12" style="height:30px;"></div>' +
              '<input id="input_word" class="form-control" type="text" placeholder="Wort eingeben">' +
              '<div class="col-xs-12" style="height:30px;"></div>' +
              '<button type="button" class="btn btn-warning" onclick="solve_document();">Lösung</button> ' +
              '<button type="button" class="btn btn-success" onclick="next_document();">Nächstes Wort</button>';
  return html;
}

/*
 * Show results (correct/wrong) for training set.
 */
function render_end_result() {
  var html =  '<p>Gratulation, du hast die Lektion abgeschlossen. Dein Resultat:</p><p>' + documents_correct + ' Wörter waren korrekt.</p><p>' + 
              documents_wrong + ' Wörter waren falsch.</p><p>Quote: ' + documents_correct/(documents_correct+documents_wrong)*100 + '%</p>' +
              '<button type="button" class="btn btn-primary" onclick="new_training_session();">Neu starten</button>';
  return html;
}

/*
 * Triggered by user clicking 'next'. Verifies the word the user wrote, shows next image or end results.
 */
function next_document() {
  if(old_document) {
    verify_document(old_document);
  }
  if (documents.length == 0) {
    var html = render_end_result();
    reset_env();
  } else {
    var new_document = get_random_document();
    old_document = new_document;
    var html = render_question(new_document);
  }
  $("#div_ask_document").html(html);
}

/*
 * Verify if user input matches word
 */
function verify_document(old_document) {
  if (old_document["fields"]["word"] == $("#input_word").val()) {
    documents_correct = documents_correct + 1;
  } else {
    documents_wrong = documents_wrong + 1;
  }
}

/*
 * Provide answer if user does not know
 */
function solve_document() {
  $("#input_word").val(old_document["fields"]["word"]);
}

/*
 * Start a new training session. Either on training set select change or after session end.
 */
function new_training_session() {
  new_session = true;
  if (documents.length > 0) {
    if (!confirm('Bist du sicher, dass du eine neue Einheit starten möchtest?')) {
      new_session = false;
    }
  }
  if( $("#select_training_set").val() >= 0 && new_session ) {
    reset_env();
    documents = get_documents();
    next_document();
  }
}

/*
 * Reset global training session variables
 */
function reset_env() {
  documents = [];
  documents_correct = 0;
  documents_wrong = 0;
  old_document = false;
}

/*
 * If user selects a set, start training session
 */
$( "#select_training_set" ).change(function() {
  new_training_session();
});

/*
 * Load available training sets after page load
 */
$( document ).ready(function() {
  reset_env();
  get_available_sets();
});