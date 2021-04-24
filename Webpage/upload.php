<?php 

#we will check wether it has even been submitted: 
if (isset($_POST['submit'])) {
    #Set file variables:
    $file = $_FILES['dataset'];
    
    $fileName = basename($file['name']); 
    $fileTmpName = $file['tmp_name'];
    $fileSize = $file['size'];
    $fileError = $file['error'];
    $fileType = $file['type'];

    #now, check whether the file is of the correct type:
    $fileExtRaw = explode("." , $fileName);
    $fileExt = strtolower(end($fileExtRaw));

    #allowed is an array consisting of the allowed data types:
    $allowed = array("csv");

    #Execute the check:
    if (in_array($fileExt, $allowed)) {
        #check for general error:
        if($fileError === 0) { #"===" needed because it must also be of integer type
            #Upload the file to the "upload" folder:
            $newFileName = "dataset.".$fileExt;
            $newFilePath = "upload/".$newFileName;

            #move the file:
            move_uploaded_file($fileTmpName , $newFilePath);

            #return to html page:
            header("location: dbl_vis.html");

        } else {
            echo "There was an error uploading your file: ".$fileError;
        }

    } else { 
        echo "This type of file is not allowed.";
    }

}

?> 