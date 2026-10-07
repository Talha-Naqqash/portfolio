<?php
// 1. Set Your Timezone & JazzCash Merchant Credentials
// (Ensure your server timezone is set to PKT so the timestamp matches JazzCash servers)
date_default_timezone_set('Asia/Karachi');

// REPLACE THESE WITH YOUR LIVE JAZZCASH CREDENTIALS
$merchant_id    = "YOUR_MERCHANT_ID"; 
$password       = "YOUR_PASSWORD";
$integrity_salt = "YOUR_INTEGRITY_SALT"; 

// This is the URL to the webhook.php file we created earlier
$return_url     = "https://pay.yourisp.com/webhook.php"; 

// The gateway endpoint (Use the Sandbox URL for testing, change to live for production)
$jazzcash_url   = "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";
// LIVE URL: https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/

// 2. Capture Form Data from index.html
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die("Direct access not allowed.");
}

$user_id = $_POST['user_id'] ?? 'UNKNOWN';
$amount  = $_POST['amount'] ?? 0;

if ($amount <= 0 || empty($user_id)) {
    die("Invalid payment details.");
}

// 3. Prepare the JazzCash Transaction Array
// Note: JazzCash requires the amount in Paisas (Multiply PKR by 100)
$amount_in_paisas = $amount * 100;

// Generate Date/Time formats required by JazzCash (Format: YYYYMMDDHHMMSS)
$current_time = date('YmdHis');
$expiry_time  = date('YmdHis', strtotime('+1 hour'));

// Create a unique Transaction Reference Number (starts with 'T' + timestamp)
$txn_ref_no   = "T" . $current_time;

$post_data = array(
    "pp_Version"           => "1.1",
    "pp_TxnType"           => "", // Empty for hosted checkout page
    "pp_Language"          => "EN",
    "pp_MerchantID"        => $merchant_id,
    "pp_SubMerchantID"     => "",
    "pp_Password"          => $password,
    "pp_BankID"            => "",
    "pp_ProductID"         => "",
    "pp_TxnRefNo"          => $txn_ref_no,
    "pp_Amount"            => $amount_in_paisas,
    "pp_TxnCurrency"       => "PKR",
    "pp_TxnDateTime"       => $current_time,
    "pp_BillReference"     => $user_id, // We map the Wateen User ID here!
    "pp_Description"       => "Internet Package Renewal for " . $user_id,
    "pp_TxnExpiryDateTime" => $expiry_time,
    "pp_ReturnURL"         => $return_url,
    "pp_SecureHash"        => "",
    "ppmpf_1"              => "1",
    "ppmpf_2"              => "2",
    "ppmpf_3"              => "3",
    "ppmpf_4"              => "4",
    "ppmpf_5"              => "5"
);

// 4. Generate the Secure Hash (HMAC-SHA256)
// Step A: Filter out empty values and the empty 'pp_SecureHash' placeholder
$hash_array = array_filter($post_data, function($val) {
    return ($val !== null && $val !== "");
});

// Step B: Sort the array alphabetically by key (Mandatory JazzCash rule)
ksort($hash_array);

// Step C: Concatenate the Integrity Salt and all values using the '&' separator
$hash_string = $integrity_salt;
foreach ($hash_array as $key => $value) {
    $hash_string .= '&' . $value;
}

// Step D: Hash using HMAC SHA-256 and convert it to UPPERCASE
$secure_hash = hash_hmac('sha256', $hash_string, $integrity_salt);
$post_data['pp_SecureHash'] = strtoupper($secure_hash);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Redirecting to Secure Gateway...</title>
    <!-- Tailwind for a quick loading spinner while the redirect happens -->
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 flex items-center justify-center min-h-screen">
    
    <div class="text-center">
        <!-- CSS Loader Animation -->
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <h2 class="text-xl font-semibold text-gray-700">Connecting to Secure Payment Gateway...</h2>
        <p class="text-gray-500 text-sm mt-2">Please do not refresh or close this page.</p>
    </div>

    <!-- 5. The Hidden Auto-Submitting Form -->
    <form id="jazzcash-form" method="POST" action="<?php echo $jazzcash_url; ?>" style="display: none;">
        <?php
        // Loop through our prepared array and create a hidden HTML input for every parameter
        foreach ($post_data as $key => $value) {
            echo '<input type="hidden" name="' . htmlspecialchars($key) . '" value="' . htmlspecialchars($value) . '">';
        }
        ?>
    </form>

    <!-- Execute the form submission immediately upon page load -->
    <script>
        document.addEventListener("DOMContentLoaded", function() {
            document.getElementById('jazzcash-form').submit();
        });
    </script>
</body>
</html>
