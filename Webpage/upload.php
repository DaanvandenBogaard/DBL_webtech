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

        } else if ($fileError === 1){
            #File size error (from php.ini)
            echo '<script type="text/javascript">alert("The uploaded file exceeded the maximum file size."); window.location.href = "dbl_vis.html";</script>';
        } else if ($fileError === 2){
            #File size error (from HTML form)
            echo '<script type="text/javascript">alert("The uploaded file exceeded the maximum file size."); window.location.href = "dbl_vis.html";</script>';
        } else if ($fileError === 3){
            #File partial upload error
            echo '<script type="text/javascript">alert("The uploaded file was only partially uploaded."); window.location.href = "dbl_vis.html";</script>';
        } else if ($fileError === 4){
            #File missing error
            echo '<script type="text/javascript">alert("No file was uploaded."); window.location.href = "dbl_vis.html";</script>';
        } else if ($fileError === 6){
            #Missing folder error
            echo '<script type="text/javascript">alert("Missing a temporary folder."); window.location.href = "dbl_vis.html";</script>';
        } else if ($fileError === 7){
            #Disk error
            echo '<script type="text/javascript">alert("Failed to write file to disk."); window.location.href = "dbl_vis.html";</script>';
        } else if ($fileError === 8){
            #PHP error
            echo '<script type="text/javascript">alert("A PHP extension stopped the file upload."); window.location.href = "dbl_vis.html";</script>';
        }

    } else { 
        #File type error [TESTED]
        echo '<script type="text/javascript">alert("This type of file is not allowed."); window.location.href = "dbl_vis.html";</script>';
    }

}

?> 