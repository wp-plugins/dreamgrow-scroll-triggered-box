<?php
    if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) )
        exit();
    function uninstall(){
        delete_option( 'sdb_settings' );
        delete_option( 'sdb_html' );
    }
    uninstall();
?>