var preview = false;

function togglePreview() {
  if(preview) {
    $('#preview').children()[0].innerHTML = "Preview";
    $('div.preview').removeClass('preview');
    preview = false;
  } else {
    $('#preview').children()[0].innerHTML = "Close";
    $('div.center').addClass('preview');
    preview = true;
  }
}
