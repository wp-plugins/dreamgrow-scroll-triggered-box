<?php
/**
Plugin Name: Scroll Triggered Box
Plugin URI: http://www.dreamgrow.com/dreamgrow-scroll-triggered-box/
Description: Scroll Triggered Box
Version: 2.1.1
Author: Dreamgrow Digital
Author URI: http://www.dreamgrow.com
License: GPL2
*/

if(!defined('DGDSCROLLBOXTYPE'))
    define('DGDSCROLLBOXTYPE', 'dgd_scrollbox');        // DO NOT TOUCH!

if(!defined('DGDSCROLLBOX_VERSION'))
    define('DGDSCROLLBOX_VERSION', '2.1.1');

require_once(plugin_dir_path(__FILE__).'dgd-scrollbox-helper.class.php');

class DgdScrollbox {
    public $html=array();
    private $output='html';

    public function __construct() {
        add_action('init', array($this, 'create_dgd_scrollbox_post_type') );
        add_action('wp_enqueue_scripts', array($this, 'enqueue_style_n_script') );
        add_shortcode('close-button', array($this, 'close_button') );
        add_action('wp_ajax_dgd_stb_form_process', array($this, 'dgd_stb_form_process'));
        add_action('wp_ajax_nopriv_dgd_stb_form_process', array($this, 'dgd_stb_form_process'));
        add_action('wp_footer',  array($this, 'do_footer'), 100);
        add_action('widgets_init', array($this, 'scrollbox_widgets_init'), 15);
        if(is_admin()) {
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

    public function scrollbox_widgets_init() {
        register_sidebar( array(
            'name' => 'Scrollbox',
            'id' => DGDSCROLLBOXTYPE.'_1',
            'description' => 'Dreamgrow scroll triggered box',
            'before_widget' => '<div>',
            'after_widget' => '</div>',
            'before_title' => '<h2 class="rounded">',
            'after_title' => '</h2>',
        ) );
    }

    public function dgd_stb_form_process() {
        $nonce = $_POST['stbNonce'];        
        if (!wp_verify_nonce($nonce, 'dgd_stb_nonce')) {
            die (json_encode(array('html'=>'Sorry, but you must reload this page!', 'status'=>'500')));
        }
        
        $box_id=(int)str_replace( DGDSCROLLBOXTYPE.'-', '', $_POST['box']);
        $box_id = filter_var($box_id, FILTER_VALIDATE_INT);
        $meta=get_post_meta($box_id, 'dgd_stb', true );
        if(!isset($meta['thankyou'])) {
            $meta['thankyou']=DgdScrollboxHelper::$dgd_stb_meta_default['thankyou'];
        }

        if(isset($_POST['email'])) {
            $email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
        } else {
            $email = $meta['receiver_email'];
        }

        $emailTo = $meta['receiver_email'] ? $meta['receiver_email'] : get_settings('admin_email');
        $subject = __('Dgd Scrollbox submit on ' . get_bloginfo('name'));
        $body="Submitted values:\n";
        foreach($_POST as $name=>$value) {
            if(!in_array($name, array('action', 'stbNonce', 'submitted'))) { 
                $body.=htmlspecialchars($name).': '.htmlspecialchars($value)."\n"; 
            }
        }
        $body.="===============================\n";
        $body.='Submitted from IP: '.$_SERVER['REMOTE_ADDR']."\n";
        $body.='Used browser: '.$_SERVER['HTTP_USER_AGENT']."\n";

        $headers = 'From: ' . $emailTo . "\r\n" . 'Reply-To: ' . $email;

        wp_mail($emailTo, $subject, $body, $headers);
        die(json_encode(array('html'=>$meta['thankyou'], 'status'=>'200')));
    }

    public function fix_content_filter() {
        // Remove br after hidden input
        // <input id="submitted" name="submitted" type="hidden" value="true" /><br />
        // <input id="stb-submit" type="submit" value="Subscribe" /></form>
        // <p class="stbMsgArea">
        // add &nbsp; to empty <p></p>
        // </div>        
    }

    private function get_widget_content() {
        if(is_active_sidebar( DGDSCROLLBOXTYPE.'_1' )) { 
            ob_start();
            dynamic_sidebar( DGDSCROLLBOXTYPE.'_1' ); 
            return ob_get_clean();
        }
        return '';
    }

    private function get_html() {
        $output='';
        $widget_content=$this->get_widget_content();

        foreach($this->html as $box) {
            $output.='<div class="dgd_stb_box '.$box['theme'].'" id="'.$box['id'].'">';
            $output.='<a class="dgd_stb_box_close dgd_stb_box_x" href="javascript:void(0);"> </a>';
            $output.=do_shortcode($box['html']);
            if($box['widget_enabled']) $output.=$widget_content;
            $output.='</div>'."\n\n";
        }
        return $output;
    }

    private function get_scrollboxes() {
        $active_pop_ups=$this->get_matching_popups();
        $js=array();
        $widget_enabled=false;
        if(count($active_pop_ups)>0) {
            foreach($active_pop_ups as $pop_up) {
                $meta=get_post_meta( $pop_up->ID, 'dgd_stb', true );

                // set and unset some parameters
                if(isset($meta['receiver_email']) && $meta['receiver_email']) {
                    $meta['receiver_email']='1';
                } else {
                    $meta['receiver_email']='0';
                }
                
                if(isset($meta['widget_enabled'])) {
                    $widget_enabled=true;
                }

                $meta['id']=DGDSCROLLBOXTYPE.'-'.$pop_up->ID;
                $meta['voff']=0;
                $meta['hoff']=0;
                $html=$pop_up->post_content;                
                if (isset($meta['migrated_no_css'])) {
                    $html='<div id="scrolltriggered">'.$html.'</div>';
                } 
                if($this->output=='js') {
                    $meta['html']=$html;
                } else {
                    $this->html[]=array(
                        'id'=>$meta['id'],
                        'theme'=>$meta['theme'],
                        'widget_enabled'=>$widget_enabled,
                        'html'=>$html,
                        );
                }
                $js[]=$meta;
            }
        } 
        return $js;
    }

    /**
        Returns array of popup page objects + meta info
    */
    private function get_matching_popups() {
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
            $hide_on=get_post_meta($pop_up->ID, 'dgd_stb_hide', true);
            $meta=get_post_meta($pop_up->ID, 'dgd_stb', true);

            $popupcookie=$meta['cookieLifetime'];
            $clientcookie=(isset($_COOKIE[DGDSCROLLBOXTYPE.'-'.$pop_up->ID]) ? $_COOKIE[DGDSCROLLBOXTYPE.'-'.$pop_up->ID]*1 : -1);
            if ($clientcookie=='9000') {
                // closed for ever
                continue;
            }

            if (isset($show_on['admin_only']) && !current_user_can('manage_options')) {
                continue;
            } else if($popupcookie>-1 && $clientcookie>-1 && $popupcookie>=$clientcookie) {
                // client already has same or shorter cookie than server, skip
                // $popupcookie==-1: show always
                continue;
            }

            if (
                ( 
                 (isset($show_on['post_types']) && in_array(get_post_type($post->ID), array_keys($show_on['post_types']))) ||
                 (isset($show_on['frontpage']) && get_option('page_on_front')==$post->ID) ||
                 (isset($show_on['selected_pages']) && in_array($post->ID, array_values($show_on['selected_pages']) )) ||
                 (isset($show_on['categories']) && is_array($categories) && count(array_intersect($show_on['categories'], $categories))>0) ||
                 (isset($show_on['tags']) && is_array($tags) && count(array_intersect($show_on['tags'], $tags))>0)
                )  &&  (
                 !(isset($hide_on['selected_pages']) && in_array($post->ID, array_values($hide_on['selected_pages']) )) &&
                 !(isset($hide_on['categories']) && is_array($categories) && count(array_intersect($hide_on['categories'], $categories))>0) &&
                 !(isset($hide_on['tags']) && is_array($tags) && count(array_intersect($hide_on['tags'], $tags))>0)
                )
               ) {
                    $active_pop_ups[]=$pop_up;
               } 
        }

        return $active_pop_ups;
    }

    public function do_footer() {
        // using HTML output gives better compatibility with other plugins
        echo "\n<!--     ===== START Dreamgrow Scroll Triggered Box =====   -->\n\n";
        echo $this->get_html();
        echo "\n<!--     ===== END OF Dreamgrow Scroll Triggered Box =====   -->\n\n";
    }

    public function enqueue_style_n_script() {
        global $post, $wp_version;
	    wp_enqueue_style( 'dgd-scrollbox-plugin-core', plugins_url( 'css/style.css', __FILE__ ), array(), DGDSCROLLBOX_VERSION );  
        wp_enqueue_script( 'dgd-scrollbox-plugin', plugins_url( 'js/script.js', __FILE__ ), array('jquery'), DGDSCROLLBOX_VERSION, false );

        $image='';
        $thumbnail=false;
        if(has_post_thumbnail($post->ID)) {
            $image = wp_get_attachment_image_src(get_post_thumbnail_id($post->ID), 'full');
            $thumbnail=$image[0];
        } 

        $scrollboxes_array=$this->get_scrollboxes();

        $data = array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('dgd_stb_nonce'),
            'debug' => (current_user_can('manage_options') ? '1' : ''),
            'permalink' => get_permalink($post->ID),
            'title' => $post->post_title,
            'thumbnail' => $thumbnail,
            'scripthost' => plugins_url('/',  __FILE__), 
        );

        if(version_compare($wp_version, '3.3', '>=')) {
            // WP=3.3 or newer
            $data['scrollboxes']= $scrollboxes_array;
        } else {
            // WP<3.3 does not support multi-dimensional arrays in wp_localize_script
            // so we add $DGD.scrollboxes separately, without wp_localize_script encoding help
            $data['l10n_print_after'] = '$DGD.scrollboxes = ' . json_encode( $scrollboxes_array ) . ';';
        }
        wp_localize_script('dgd-scrollbox-plugin', '$DGD', $data);
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