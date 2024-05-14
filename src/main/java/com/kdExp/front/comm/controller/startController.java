package com.kdExp.front.comm.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("/comm")
public class startController {
	
	@GetMapping("/index")
	public ModelAndView startPage() {
		
		ModelAndView model = new ModelAndView();
		
		model.setViewName("index");
		
		return model;
	}
	
	@GetMapping("/grid")
	public ModelAndView gridPage() {
		
		ModelAndView model = new ModelAndView();
		
		model.setViewName("example01-basic");
		
		return model;
	}

}
