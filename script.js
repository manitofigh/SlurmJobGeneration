$(document).ready(function() {
    // udpate slurm script func()
    function updateSLURMScript() {
      let scriptLines = ["#!/bin/bash\n"];
  
      // input values
      let jobName = $('#job-name').val();
      let outputFile = $('#output-file').val() || 'output-%j.out';
      let errorFile = $('#error-file').val() || 'error-%j.err';
      let numNodes = $('#num-nodes').val();
      let numCPUs = $('#num-cpus').val();
      let memoryAmount = $('#memory-amount').val();
      let memoryUnit = $('#memory-unit').val();
      let gpuJob = $('#gpu-job').is(':checked');
      let gpuType = $('#gpu-type').val();
      let numGPUs = $('#num-gpus').val();
      let ntasksPerCore = $('#ntasks-per-core').val();
      let ntasksPerNode = $('#ntasks-per-node').val();
      let cpusPerTask = $('#cpus-per-task').val();
      let modulesToLoad = $('#modules-to-load').val();
      let commands = $('#commands').val();
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
      if (numNodes) {
        scriptLines.push(`#SBATCH --nodes=${numNodes}`);
      }
      if (numCPUs) {
        scriptLines.push(`#SBATCH --ntasks=${numCPUs}`);
      }
      if (memoryAmount && memoryUnit) {
        scriptLines.push(`#SBATCH --mem=${memoryAmount}${memoryUnit}`);
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
      if (modulesToLoad) {
        modulesToLoad.forEach(function(module) {
          scriptLines.push(`module load ${module}`);
        });
      }
      if (commands) {
        scriptLines.push(commands);
      }
      if (emailEvents.length > 0) {
        scriptLines.push(`#SBATCH --mail-type=${emailEvents.join(',')}`);
        scriptLines.push(`#SBATCH --mail-user=user@example.com`);
      }
  
      // set content ot the script div
      $('#slurm-script').text(scriptLines.join('\n'));
    }
  
    // Event handlers for form inputs
    $('input, select, textarea').on('change keyup paste', function() {
      updateSLURMScript();
    });
  
    // Toggle GPU-specific options
    $('#gpu-job').on('change', function() {
      if ($(this).is(':checked')) {
        $('.gpu-specific').show();
      } else {
        $('.gpu-specific').hide();
      }
      updateSLURMScript();
    }).trigger('change'); 
  
    // Copy to clipboard
    $('#copy-button').on('click', function() {
      let scriptText = $('#slurm-script').text();
      navigator.clipboard.writeText(scriptText).then(function() {

        let $button = $('#copy-button');
        $button.text('Copied!');
        // Reset button text after 2 seconds
        setTimeout(function() {
          $button.text('Copy');
        }, 2000);
      }).catch(function(error) {
        // copy errors
        console.error('Copy failed', error);
        $('#copy-button').text('Failed to copy');
      });
    });
  });
