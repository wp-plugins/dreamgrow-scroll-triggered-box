<?php
/**
Plugin Name: Scroll Triggered Box
Plugin URI: http://dreamgrow.com
Description: Scroll Triggered Box
Version: 2.0.3
Author: Dreamgrow Digital
Author URI: http://dreamgrow.com
License: GPL2
*/

if(!function_exists('wp_get_current_user')) {
    include(ABSPATH.'wp-includes/pluggable.php'); 
}

define('DGDSCROLLBOXTYPE', 'dgd_scrollbox');        // if you change it here, please change also in wpml-config.xml

require_once(plugin_dir_path(__FILE__).'dgd-scrollbox-helper.class.php');

class DgdScrollbox {
    public function __construct() {
        add_action('init', array($this, 'create_dgd_scrollbox_post_type') );
        add_action('wp_footer',  array($this, 'show_scrollbox'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_style_n_script') );
        add_shortcode('close-button', array($this, 'close_button') );
        add_action('wp_ajax_dgd_stb_form_process', array($this, 'dgd_stb_form_process'));
        add_action('wp_ajax_nopriv_dgd_stb_form_process', array($this, 'dgd_stb_form_process'));
        if(is_admin() && current_user_can('manage_options')) {
            require_once(plugin_dir_path(__FILE__).'dgd-scrollbox-admin.class.php');
            new DgdScrollboxAdmin();
            register_activation_hook(__FILE__, array('DgdScrollboxAdmin', 'install') );
            register_deactivation_hook(__FILE__, array('DgdScrollboxAdmin', 'uninstall') );
        }
    }

    function create_dgd_scrollbox_post_type() {
      register_post_type( DGDSCROLLBOXTYPE,
        array(
          'labels' => array(
            'name' => __( 'Scrollboxes' ),
            'singular_name' => __( 'Scrollbox' ),
            'add_new' => __( 'Add New Scrollbox'),
            'all_items' => __('All Scrollboxes'),
            'add_new_item' => __( 'Add new Scrollbox'),
            'edit_item' => __( 'Modify Scrollbox'),
            'not_found' => __( 'No Scrollboxes found' ),
          ),
          'public' => true,
          'hierarchical' => true,
          'has_archive' => false,
          'exclude_from_search' => true,
          'show_in_nav_menus' => false,
          'show_in_menu' => true,
          'show_ui' => true,
          'menu_position' => 20.001,
          'menu_icon' => 'dashicons-welcome-comments',
          'capability_type' => 'page', // to use custom template???
          'supports' =>array('title', 'editor'),
        )
      );
    }

    public function dgd_stb_form_process() {
        
        $nonce = $_POST['stbNonce'];        
        if (!wp_verify_nonce($nonce, 'dgd_stb_nonce')) {
            die ('Sorry, but you must reload this page!');
        }
        
        $box_id=(int)str_replace( DGDSCROLLBOXTYPE.'-', '', $_POST['box']);
        $email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
        $box_id = filter_var($box_id, FILTER_VALIDATE_INT);
        $meta=get_post_meta($box_id, 'dgd_stb', true );

        $emailTo = $meta['receiver_email'] ? $meta['receiver_email'] : get_settings('admin_email');
        $subject = __('Dgd Scrollbox submit on ' . get_bloginfo('name'));
        $body="Submitted values:\n";
        foreach($_POST as $name=>$value) {
            if(!in_array($name, array('action', 'stbNonce', 'submitted'))) { 
                $body.=$name.': '.$value."\n"; 
            }
        }
        $body.='IP: '.$_SERVER['REMOTE_ADDR']."\n";

        $headers = 'From: ' . $emailTo . "\r\n" . 'Reply-To: ' . $email;

        wp_mail($emailTo, $subject, $body, $headers);
        echo __('You are subscribed. Thank You!', 'stb');
        die();
    }

    public function fix_content_filter() {
        // Remove br after hidden input
        // <input id="submitted" name="submitted" type="hidden" value="true" /><br />
        // <input id="stb-submit" type="submit" value="Subscribe" /></form>
        // <p class="stbMsgArea">
        // add &nbsp; to empty <p></p>
        // </div>        
    }


    public function show_scrollbox() {
        global $post;
        // Activate everywhere
        // Activate on Tag
        $active_pop_ups=$this->get_matching_popups();
        $html="\n<!--     ===== Dreamgrow Scroll Triggered Box =====   -->\n\n";
        $js=array();
        $closebutton='<a class="dgd_stb_box_close dgd_stb_box_x" href="javascript:void(0);"> </a>';
        if(count($active_pop_ups)>0) {
            foreach($active_pop_ups as $pop_up) {
                $meta=get_post_meta( $pop_up->ID, 'dgd_stb', true );

                /*
                if(isset($meta['theme']) && $meta['theme']) {
                    wp_enqueue_style( 'dgd-scrollbox-plugin-template-'.$meta['theme'], 
                        plugins_url( 'themes/'.$meta['theme'].'/style.css', __FILE__ ) );  
                }
                */

                // set and unset some parameters
                if(isset($meta['receiver_email']) && $meta['receiver_email']) {
                    $meta['receiver_email']=1;
                } else {
                    $meta['receiver_email']=0;
                }
                $meta['id']=DGDSCROLLBOXTYPE.'-'.$pop_up->ID;
                $meta['voff']=0;
                $meta['hoff']=0;
                //  $js[]=$meta;
                if (isset($meta['migrated_no_css'])) {
                    $meta['html']=$closebutton.'<div id="scrolltriggered">'.do_shortcode($pop_up->post_content).'</div>';
                } else {
                    $meta['html']=$closebutton.do_shortcode($pop_up->post_content);                
                }

                $js[]=json_encode($meta);
            }
        } 
        // wp_localize_script('dgd-popup-plugin', 'dgd_scrollboxes', array('l10n_print_after'=>"dgd_scrollboxes=[\n".$js."];\n"));
        $html.= "<script type='text/javascript'>//<![CDATA[ \n";
        $html.= "var dgd_scrollboxes=[".implode(','.PHP_EOL, $js)."];\n";
        $html.= "var scripthost='".plugins_url('/',  __FILE__)."';\n"; 
        $html.= "var head=document.getElementsByTagName('head')[0];\n";
        $html.= "//]]>\n</script>\n";
        $html.="\n<!--     ===== END OF Dreamgrow Scroll Triggered Box =====   -->\n\n";
        echo $html;
    }

    /**
        Returns array of popup page objects + meta info
    */
    public function get_matching_popups() {
        global $post;
        $active_pop_ups=array();

        if(!isset($post->ID)) {
            // Error 404 page, do we possibly need to show any popups here? Assume not.
            return array();
        }

        $tags=DgdScrollboxHelper::get_all_tags_ids($post->ID);
        $categories=wp_get_post_categories( $post->ID );
        $pop_ups = get_pages( array('post_type'=>DGDSCROLLBOXTYPE, 'post_status' => 'publish')); 
        

        // compare pop-up definition with page, 
        foreach($pop_ups as $pop_up) {

            // get showing options
            $show_on=get_post_meta($pop_up->ID, 'dgd_stb_show', true);
            $meta=get_post_meta($pop_up->ID, 'dgd_stb', true);

            $popupcookie=$meta['cookieLifetime'];
            $clientcookie=(isset($_COOKIE[DGDSCROLLBOXTYPE.'-'.$pop_up->ID]) ? $_COOKIE[DGDSCROLLBOXTYPE.'-'.$pop_up->ID]*1 : -1);

            if (isset($show_on['admin_only']) && !current_user_can('manage_options')) {
                continue;
            } else if($popupcookie>-1 && $clientcookie>-1 && $popupcookie>=$clientcookie) {
                // client already has same or shorter cookie than server, skip
                // $popupcookie==-1: show always
                continue;
            }

            if( (isset($show_on['post_types']) && in_array(get_post_type($post->ID), array_keys($show_on['post_types']))) ||
                (isset($show_on['frontpage']) && get_option('page_on_front')==$post->ID) ||
                (isset($show_on['selected_pages']) && in_array($post->ID, array_values($show_on['selected_pages']) )) ||
                (isset($show_on['categories']) && is_array($categories) && count(array_intersect($show_on['categories'], $categories))>0) ||
                (isset($show_on['tags']) && is_array($tags) && count(array_intersect($show_on['tags'], $tags))>0) ) {
                    $active_pop_ups[]=$pop_up;
            } 
        }

        return $active_pop_ups;
    }

    public function enqueue_style_n_script() {
        global $post;
	    wp_enqueue_style( 'dgd-scrollbox-plugin-core', plugins_url( 'css/style.css', __FILE__ ) );  
	    wp_enqueue_style( 'visualidiot-real-world', plugins_url( 'css/visualidiot-real-world.css', __FILE__ ) );  
        wp_enqueue_script( 'dgd-scrollbox-plugin', plugins_url( 'js/script.js', __FILE__ ), array('jquery') );
        // wp_enqueue_script( 'dgd-scrollbox-plugin-social', plugins_url( 'js/social.js', __FILE__ ), array('dgd-scrollbox-plugin') );

        $image='';
        $thumbnail=false;
        if(has_post_thumbnail($post->ID)) {
            $image = wp_get_attachment_image_src(get_post_thumbnail_id($post->ID), 'full');
            $thumbnail=$image[0];
        } 

        $data = array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('dgd_stb_nonce'),
            'debug' => current_user_can('manage_options'),
            'permalink' => get_permalink($post->ID),
            'title' => $post->post_title,
            'thumbnail' => $thumbnail,
        );
        wp_localize_script('dgd-scrollbox-plugin', 'dgdStbAjax', $data);
    }

    public function close_button($atts) {
        $text='Close';
        if(is_array($atts) and isset($atts['text'])) {
            $text=$atts['text'];
        }
        return '<a class="dgd_stb_box_close_button">'.$text.'</a>';
    }

}

new DgdScrollbox();