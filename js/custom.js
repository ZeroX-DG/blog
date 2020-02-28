function readonlyCheckbox() {
  let checkboxes = document.querySelectorAll('input[type=checkbox]');
  checkboxes.forEach(checkbox => {
    checkbox.readOnly = true;
    checkbox.disabled = true;
  });
}

readonlyCheckbox();
