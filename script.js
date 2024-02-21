// udpate slurm script func()
function updateSLURMScript() {
  let scriptLines = ["#!/bin/bash\n"];

  // input values
  let jobName = $('#job-name').val();
  let outputFile = $('#output-file').val();
  let errorFile = $('#error-file').val();
  let walltimeHours = $('#walltime-hours').val() || '0';
  let walltimeMinutes = $('#walltime-minutes').val() || '0';
  let walltimeSeconds = $('#walltime-seconds').val() || '0';
  let walltime = `${walltimeHours}:${walltimeMinutes}:${walltimeSeconds}`;
  let numNodes = $('#num-nodes').val();
  let numCPUs = $('#num-cpus').val();
  let memoryAmount = $('#memory-amount').val();
  let memoryUnit = $('#memory-unit').val();
  let testQoS = $('#test-qos').is(':checked');
  let jobPreemptable = $('#job-preemptable').is(':checked');
  let gpuJob = $('#gpu-job').is(':checked');
  let gpuType = $('#gpu-type').val();
  let numGPUs = $('#num-gpus').val();
  let ntasksPerCore = $('#ntasks-per-core').val();
  let ntasksPerNode = $('#ntasks-per-node').val();
  let cpusPerTask = $('#cpus-per-task').val();
  let selectedModules = $('.custom-dropdown .dropdown-toggle.selected').map(function() { return $(this).text(); }).get();
  let commands = $('#commands').val();
  let emailAddress = $('#email-address').val();
  let emailEvents = $('input[name="email-events"]:checked').map(function() { return this.value; }).get();

  // Construct the SLURM script
  if (jobName) {
    scriptLines.push(`#SBATCH --job-name=${jobName}`);
  }

  if (outputFile) {
    scriptLines.push(`#SBATCH --output=${outputFile}`);
  }

  if (errorFile) {
    scriptLines.push(`#SBATCH --error=${errorFile}`);
  }

  if (walltime !== '0:0:0') {
    scriptLines.push(`#SBATCH --time=${walltime}`);
  }

  if (numNodes) {
    scriptLines.push(`#SBATCH --nodes=${numNodes}`);
  }

  if (numCPUs) {
    scriptLines.push(`#SBATCH --ntasks=${numCPUs}`);
  }

  if (memoryAmount && memoryUnit) {
    scriptLines.push(`#SBATCH --mem=${memoryAmount}${memoryUnit}`);
  }

  if (testQoS) {
    scriptLines.push("#SBATCH --qos=test");
  }

  if (jobPreemptable) {
    scriptLines.push("#SBATCH --qos=preemptable");
  }

  if (gpuJob && gpuType && numGPUs) {
    scriptLines.push(`#SBATCH --gres=gpu:${gpuType}:${numGPUs}`);
  }

  if (ntasksPerCore) {
    scriptLines.push(`#SBATCH --ntasks-per-core=${ntasksPerCore}`);
  }

  if (ntasksPerNode) {
    scriptLines.push(`#SBATCH --ntasks-per-node=${ntasksPerNode}`);
  }

  if (cpusPerTask) {
    scriptLines.push(`#SBATCH --cpus-per-task=${cpusPerTask}`);
  }
  
  let wantEmail = $('#email-notifications').is(':checked');
  if (wantEmail && emailAddress) {
    scriptLines.push(`#SBATCH --mail-user=${emailAddress}`);
    if (emailEvents.length > 0) {
      scriptLines.push(`#SBATCH --mail-type=${emailEvents.join(',')}`);
    }
  }

  // Add the selected modules to the script
  selectedModules.forEach(function(module) {
    scriptLines.push(`module load ${module}`);
  });

  if (commands) {
    scriptLines.push(`\n${commands}`);
  }

 // Set content of the script div
 $('#slurm-script').text(scriptLines.join('\n'));
}

function transformMultiSelect() {
  $('select[multiple]').each(function() {
    var $select = $(this);
    var $dropdown = $('<div class="custom-dropdown"></div>').text('Select modules ↓');
    var $dropdownContent = $('<div class="custom-dropdown-content"></div>');

    // Add options to dropdown content
    $select.find('option').each(function() {
      var $option = $(this);
      var $toggle = $('<div class="dropdown-toggle"></div>').text($option.text());
      $toggle.on('click', function(e) {
        e.stopPropagation(); // Prevent the dropdown from closing immediately
        $option.prop('selected', !$option.prop('selected'));
        $(this).toggleClass('selected');
        updateSLURMScript(); // Update the script when an option is toggled
      });
      $dropdownContent.append($toggle);
    });

    // Show dropdown content when the base dropdown is clicked
    $dropdown.on('click', function(e) {
      e.stopPropagation(); // Prevent the click on the dropdown from hiding the dropdown content
      $dropdownContent.toggle();
    });

    $dropdown.append($dropdownContent);
    $select.hide().after($dropdown);
  });
}

$(document).ready(function() {
    // Transform multi-select dropdowns for modules
    transformMultiSelect();
   
     // Hide dropdown content when clicking outside
    $(document).on('click', function(e) {
      $('.custom-dropdown-content').hide();
    });

    // Event handlers for form inputs
    $('input, select, textarea').on('change keyup paste', function() {
      updateSLURMScript();
    });

    // Toggle GPU-specific options
    $('#gpu-job').on('change', function() {
      $('.gpu-specific').toggle(this.checked);
      updateSLURMScript();
    }).trigger('change');

    // Toggle email notification settings
    $('#email-notifications').on('change', function() {
      $('.email-settings').toggle(this.checked);
    });

    $('#job-preemptable').on('change', function() {
      updateSLURMScript();
    });

    // Copy to clipboard functionality
    $('#copy-button').on('click', function() {
      let scriptText = $('#slurm-script').text();
      navigator.clipboard.writeText(scriptText).then(function() {
        let $button = $('#copy-button');
        $button.text('Copied ✓');
        setTimeout(function() { $button.text('Copy'); }, 1000);
      }).catch(function(error) {
        console.error('Copy failed', error);
        $('#copy-button').text('Failed to copy');
      });
    });
});
